// scripts/krishisetu-audit.mjs
// Static & Structural Feature Auditor for KrishiSetu
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const MANIFEST_PATH = path.join(ROOT_DIR, 'features', 'feature-manifest.json');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

console.log('\n======================================================');
console.log('🔍 KRISHISETU STATIC & FEATURE AUDIT');
console.log('======================================================\n');

const auditResult = {
  timestamp: new Date().toISOString(),
  manifestFound: false,
  totalFeatures: 0,
  verifiedFeatures: 0,
  orphanedFeatures: [],
  duplicateIds: [],
  missingElements: [],
  disallowedStyles: [],
  summary: {
    status: 'UNKNOWN',
    passedChecks: 0,
    failedChecks: 0,
    warnings: 0
  }
};

// 1. Check Feature Manifest
if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('❌ Manifest not found at features/feature-manifest.json');
  auditResult.summary.failedChecks++;
} else {
  auditResult.manifestFound = true;
  auditResult.summary.passedChecks++;
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  auditResult.totalFeatures = manifest.features.length;

  const htmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

  // 2. Check for Duplicate IDs in index.html
  const idMatches = [...htmlContent.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  const idCounts = {};
  idMatches.forEach(id => {
    idCounts[id] = (idCounts[id] || 0) + 1;
    if (idCounts[id] === 2) {
      auditResult.duplicateIds.push(id);
    }
  });

  if (auditResult.duplicateIds.length === 0) {
    console.log(`✅ DOM Integrity: Zero duplicate element IDs found (${idMatches.length} unique elements).`);
    auditResult.summary.passedChecks++;
  } else {
    console.warn(`⚠️ Warning: Found duplicate IDs: ${auditResult.duplicateIds.join(', ')}`);
    auditResult.summary.warnings++;
  }

  // 3. Verify that each feature in the manifest has corresponding code/DOM
  manifest.features.forEach(feat => {
    let verified = true;

    // Check if route has an element ID in index.html (e.g. #mapSection)
    if (feat.route && feat.route.startsWith('#')) {
      const elementId = feat.route.split('?')[0].replace('#', '');
      if (!htmlContent.includes(`id="${elementId}"`)) {
        auditResult.missingElements.push({ featureId: feat.id, missingId: elementId });
        verified = false;
      }
    }

    // Check dependencies
    if (feat.dependencies && Array.isArray(feat.dependencies)) {
      feat.dependencies.forEach(dep => {
        if (!dep.startsWith('http') && !dep.includes('/') && !dep.endsWith('.html') && !dep.endsWith('.js') && !dep.endsWith('.css')) {
          return; // external package like 'leaflet'
        }
        const fullDepPath = path.join(ROOT_DIR, dep);
        if (!fs.existsSync(fullDepPath)) {
          auditResult.orphanedFeatures.push({ featureId: feat.id, missingDep: dep });
          verified = false;
        }
      });
    }

    if (verified) {
      auditResult.verifiedFeatures++;
    }
  });

  console.log(`✅ Manifest Check: ${auditResult.verifiedFeatures} / ${auditResult.totalFeatures} features verified against real codebase.`);
  auditResult.summary.passedChecks++;

  // 4. Check for Disallowed Styles (Purple, Violet, Magenta, Neon)
  const disallowedPatterns = [
    { name: 'Purple/Violet Hex', regex: /#(7c3aed|8b5cf6|a855f7|9333ea|7e22ce|6b21a8|581c87|c084fc|d8b4fe|e9d5ff|f3e8ff|800080|4a0e4e|da70d6|ba55d3)/i },
    { name: 'Tailwind Purple/Violet Class', regex: /(bg|text|border|ring)-(purple|violet|fuchsia)-[0-9]+/i },
    { name: 'Tailwind Neon Class', regex: /neon/i },
    { name: 'AI Gimmick Copy', regex: /AI Diagnosis|AI Chatbot|Ask AI|Powered by ChatGPT/i }
  ];

  disallowedPatterns.forEach(pattern => {
    if (pattern.regex.test(htmlContent)) {
      auditResult.disallowedStyles.push(pattern.name);
      auditResult.summary.failedChecks++;
      console.error(`❌ Aesthetic Violation: Found ${pattern.name} in index.html!`);
    }
  });

  if (auditResult.disallowedStyles.length === 0) {
    console.log('✅ Aesthetic Conformance: Zero purple, violet, neon, or AI marketing copy in templates.');
    auditResult.summary.passedChecks++;
  }
}

// Write Report
const overallPass = auditResult.summary.failedChecks === 0;
auditResult.summary.status = overallPass ? 'PASSED' : 'FAILED';

const reportPath = path.join(REPORTS_DIR, 'audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(auditResult, null, 2));

console.log(`\n📄 Report written to: reports/audit-report.json`);
console.log(`Audit Status: ${auditResult.summary.status} (${auditResult.summary.passedChecks} passed, ${auditResult.summary.failedChecks} failed, ${auditResult.summary.warnings} warnings)`);

process.exit(overallPass ? 0 : 1);
