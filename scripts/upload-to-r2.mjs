// scripts/upload-to-r2.mjs
// Secure, resumable multipart upload for KrishiSetu Homepage Background Video to Cloudflare R2
// Uses @aws-sdk/client-s3 and @aws-sdk/lib-storage

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const SOURCE_VIDEO_PATH = path.resolve('public/video for the websites.mp4');
const TARGET_OBJECT_KEY = 'homepage-bg.mp4';
const CONTENT_TYPE = 'video/mp4';
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

async function main() {
  console.log('======================================================');
  console.log('☁️  CLOUDFLARE R2 MULTIPART VIDEO UPLOADER');
  console.log('======================================================\n');

  // 1. Check Source Video File
  if (!fs.existsSync(SOURCE_VIDEO_PATH)) {
    console.error(`❌ Source video file not found at: ${SOURCE_VIDEO_PATH}`);
    process.exit(1);
  }

  const stats = fs.statSync(SOURCE_VIDEO_PATH);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📹 Source Video: ${path.basename(SOURCE_VIDEO_PATH)}`);
  console.log(`📦 File Size: ${stats.size} bytes (~${sizeMb} MB)`);
  console.log(`🎯 Target R2 Key: ${TARGET_OBJECT_KEY}\n`);

  // 2. Validate R2 Credentials
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const publicBaseUrl = (process.env.R2_PUBLIC_BASE_URL || process.env.VITE_HOMEPAGE_VIDEO_URL || '').trim();

  const missing = [];
  if (!accountId) missing.push('R2_ACCOUNT_ID');
  if (!accessKeyId) missing.push('R2_ACCESS_KEY_ID');
  if (!secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY');
  if (!bucketName) missing.push('R2_BUCKET_NAME');

  if (missing.length > 0) {
    console.warn('⚠️  Cloudflare R2 credentials missing in .env:');
    missing.forEach(k => console.warn(`   - ${k}`));
    console.log('\n📝 Please add the following to your local .env file:');
    console.log(`
# Cloudflare R2 Storage (Server-Only Upload Credentials)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_BASE_URL=https://pub-xxxxxx.r2.dev # or custom domain like https://cdn.krishisetu.in
VITE_HOMEPAGE_VIDEO_URL=https://pub-xxxxxx.r2.dev/homepage-bg.mp4
`);
    console.log('💡 How to get these from Cloudflare Dashboard:');
    console.log('1. Go to Cloudflare Dashboard -> R2 Object Storage.');
    console.log('2. Click "Manage R2 API Tokens" -> "Create API Token".');
    console.log('3. Permissions: "Object Read & Write", TTL: Forever, Bucket: select your bucket.');
    console.log('4. Copy Access Key ID, Secret Access Key, and Account ID (found on R2 overview page).');
    console.log('5. Under your bucket settings, enable "R2.dev subdomain" or attach a Custom Domain.\n');
    process.exit(1);
  }

  // 3. Initialize S3 Client with Cloudflare R2 Endpoint
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const s3 = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  console.log(`🚀 Connecting to Cloudflare R2 bucket: "${bucketName}"...`);
  console.log(`📡 S3 Endpoint: https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com (region: auto)\n`);

  try {
    const fileStream = fs.createReadStream(SOURCE_VIDEO_PATH);

    // Multipart upload with 10MB chunk size
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: TARGET_OBJECT_KEY,
        Body: fileStream,
        ContentType: CONTENT_TYPE,
        CacheControl: CACHE_CONTROL
      },
      partSize: 10 * 1024 * 1024, // 10 MB parts
      queueSize: 4 // 4 parallel uploads
    });

    upload.on('httpUploadProgress', (progress) => {
      const loadedMb = ((progress.loaded || 0) / (1024 * 1024)).toFixed(1);
      const totalMb = ((progress.total || stats.size) / (1024 * 1024)).toFixed(1);
      const pct = Math.round(((progress.loaded || 0) / (progress.total || stats.size)) * 100);
      process.stdout.write(`\r⏳ Uploading: ${loadedMb} MB / ${totalMb} MB (${pct}%)`);
    });

    await upload.done();
    console.log('\n\n✅ Multipart upload completed successfully!');

    // 4. Verify via authenticated HEAD request
    console.log('🔍 Verifying uploaded object via authenticated S3 HEAD request...');
    const headCmd = new HeadObjectCommand({
      Bucket: bucketName,
      Key: TARGET_OBJECT_KEY
    });
    const headRes = await s3.send(headCmd);

    console.log(`✓ Object verified on R2:`);
    console.log(`   - Object Key: ${TARGET_OBJECT_KEY}`);
    console.log(`   - Content-Length: ${headRes.ContentLength} bytes`);
    console.log(`   - Content-Type: ${headRes.ContentType}`);
    console.log(`   - ETag: ${headRes.ETag}`);
    console.log(`   - Cache-Control: ${headRes.CacheControl}\n`);

    // 5. Test Public Delivery URL
    if (publicBaseUrl) {
      const publicCleanBase = publicBaseUrl.replace(/\/+$/, '').replace(/\/homepage-bg\.mp4$/, '');
      const fullPublicUrl = `${publicCleanBase}/${TARGET_OBJECT_KEY}`;
      console.log(`🌐 Public Video URL: ${fullPublicUrl}`);

      try {
        const testRes = await fetch(fullPublicUrl, {
          method: 'HEAD',
          headers: { Range: 'bytes=0-1024' }
        });
        if (testRes.ok || testRes.status === 206) {
          console.log(`✅ Public URL verified working! (HTTP ${testRes.status}, Content-Type: ${testRes.headers.get('content-type')})`);
        } else {
          console.warn(`⚠️  Public URL returned HTTP ${testRes.status}. Make sure public bucket access (r2.dev or custom domain) is enabled in Cloudflare Dashboard.`);
        }
      } catch (err) {
        console.warn(`⚠️  Could not reach public URL: ${err.message}. Ensure DNS or r2.dev domain is active.`);
      }
    } else {
      console.log('ℹ️  R2_PUBLIC_BASE_URL is not yet configured.');
      console.log('   In Cloudflare Dashboard -> Bucket -> Settings: enable "Public Development URL (r2.dev)"');
      console.log('   Then set VITE_HOMEPAGE_VIDEO_URL=https://<your-subdomain>.r2.dev/homepage-bg.mp4 in .env');
    }

    console.log('\n======================================================');
    console.log('🎉 R2 VIDEO INTEGRATION READY');
    console.log('======================================================');

  } catch (err) {
    console.error('\n❌ Upload failed:', err.message);
    process.exit(1);
  }
}

main();
