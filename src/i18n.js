// src/i18n.js
// Complete bilingual (English & Hindi) dictionary for KrishiSetu
// Covers navigation, map controls, radius labels, categories, filters, data statuses, and modals

export const translations = {
  en: {
    // Navigation
    platformName: "KrishiSetu",
    platformTagline: "Smart Agriculture Platform",
    home: "Home",
    liveMap: "Live Map & Marketplace",
    cart: "Cart",
    dataSources: "Data Sources",
    languageButton: "🌐 हिंदी",

    // Hero
    heroTitle: "Smart Agriculture",
    heroSubtitle: "Equipment Rental & Agro-Waste Marketplace",
    heroDescription: "Connect directly with farmers and equipment owners near JKLU / Mahapura, Jaipur. Transparent rates, flexible lease terms, and zero middlemen.",
    startListing: "🚀 Start Listing",
    exploreMarketplace: "🗺️ Explore Live Map",

    // Categories
    categoriesTitle: "Agricultural Categories",
    categoriesSubtitle: "Choose your category to explore products, rentals, and services",
    agroWaste: "Agro Waste Trading",
    agroWasteDesc: "Buy and sell agricultural crop residues directly. Rice straw bales, wheat residue, cotton stalks, and bagasse for bio-energy and industries.",
    machinery: "Farm Machinery Rental",
    machineryDesc: "Heavy-duty farm machinery on flexible terms. Tractors, combine harvesters, and rotavators with daily, weekly, or seasonal rates.",
    equipment: "Farm Equipment & Tools",
    equipmentDesc: "Essential farming tools and equipment available for rent. Drip irrigation systems, high-pressure sprayers, and solar pumps.",
    rentNow: "Rent Now",
    buySellWaste: "Buy & Sell Waste",

    // Buyer Map Workspace
    searchPlaceholder: "Search crops, farmers, mandis, warehouses or farm services near JKLU...",
    mapFocusLabel: "Map Anchor:",
    jkluAnchorTitle: "JK Lakshmipat University (JKLU), Mahapura, Jaipur",
    openInGoogleMaps: "Open in Google Maps",
    resetToJklu: "📍 Reset to JKLU",
    useMyLocation: "🎯 Use My Location",
    searchThisArea: "🔍 Search This Area",
    radiusLabel: "Search Radius:",
    radius5km: "5 km",
    radius10km: "10 km",
    radius25km: "25 km (Default)",
    radius50km: "50 km",
    straightLineNote: "*Distances shown are straight-line measurements from the map anchor.",
    filterCategoryAll: "All Categories",
    filterAgroWaste: "Agro-Waste",
    filterMachinery: "Machinery Rentals",
    filterProduce: "Crop Produce",
    filterGooglePlaces: "Google Places (Nearby Services)",
    filterMandis: "Mandis & Markets",
    sortByDistance: "Sort: Nearest First",
    sortByPriceAsc: "Price: Low to High",
    sortByPriceDesc: "Price: High to Low",
    resultsCount: "results found",
    noResultsFound: "No active platform listings found in this area yet.",
    noResultsHint: "Try expanding the radius to 25 km or 50 km, or explore verified Google Places nearby.",

    // Layers & Data Sources
    layerPlatformListings: "🌾 Platform Listings",
    layerMachinery: "🚜 Machinery",
    layerGooglePlaces: "📍 Nearby Businesses (Google Places)",
    layerMandis: "🏛️ Mandis (AGMARKNET)",
    layerWeather: "🌤️ Weather (IMD)",
    layerSoil: "🌱 Soil Data",
    dataSourcesStatusTitle: "Live Data Sources Status",

    // Listing & Drawer Details
    viewListing: "View Listing",
    addToCart: "🛒 Add to Cart",
    rentEquipment: "🚜 Rent Equipment",
    requestQuote: "📝 Request Quotation",
    contactSeller: "📞 Contact Seller",
    externalPlaceLabel: "Google Maps Place (External Business)",
    verifiedSeller: "Verified Platform Seller",
    unverifiedSeller: "Platform Member",
    availableQuantity: "Available:",
    minOrderQty: "Min Order:",
    harvestDate: "Harvest Date:",
    ratePerDay: "/ day",
    ratePerWeek: "/ week (15% off)",
    ratePerMonth: "/ month (25% off)",
    dailyRental: "Daily Rental",
    weeklyRental: "Weekly Lease (15% Off)",
    monthlyRental: "Monthly Lease (25% Off)",

    // Cart & Checkout
    yourCart: "Your Cart",
    cartEmpty: "Your cart is empty",
    cartEmptySubtext: "Start adding agricultural items from the marketplace.",
    continueShopping: "Continue Browsing",
    total: "Total:",
    proceedToCheckout: "Proceed to Checkout (Unpaid Request)",
    checkoutNotice: "Note: Payment gateway is not configured yet. This creates a pending unpaid reservation request with the seller.",

    // Reviews
    communityReviews: "Farmer & Community Reviews",
    writeReview: "Write a Review",
    submitReview: "Submit Review",

    // Mobile View Toggle
    viewMap: "🗺️ Map View",
    viewList: "📋 List View",

    // Statuses
    connected: "Connected",
    setupRequired: "Setup Required",
    notConfigured: "Not Configured",
    temporarilyUnavailable: "Temporarily Unavailable"
  },
  hi: {
    // Navigation
    platformName: "कृषि सेतु",
    platformTagline: "स्मार्ट कृषि प्लेटफॉर्म",
    home: "होम",
    liveMap: "लाइव नक्शा और बाज़ार",
    cart: "कार्ट",
    dataSources: "डेटा स्रोत",
    languageButton: "🌐 English",

    // Hero
    heroTitle: "स्मार्ट कृषि",
    heroSubtitle: "कृषि उपकरण किराया और कृषि-अपशिष्ट बाज़ार",
    heroDescription: "जेकेएलयू / महापुरा, जयपुर के पास सीधे किसानों और उपकरण मालिकों से जुड़ें। पारदर्शी दरें, लचीली शर्तें और बिना बिचौलियों का सीधा व्यापार।",
    startListing: "🚀 अपनी लिस्टिंग जोड़ें",
    exploreMarketplace: "🗺️ लाइव नक्शा देखें",

    // Categories
    categoriesTitle: "कृषि श्रेणियां",
    categoriesSubtitle: "उत्पादों, किराये और सेवाओं को देखने के लिए श्रेणी चुनें",
    agroWaste: "कृषि-अपशिष्ट व्यापार",
    agroWasteDesc: "फसल अवशेषों (धान की पराली, गेहूं का भूसा, कपास की डंठल) की सीधी खरीद और बिक्री। बायो-ईंधन और उद्योगों के लिए उपयोगी।",
    machinery: "कृषि मशीनरी किराया",
    machineryDesc: "दैनिक, साप्ताहिक या मौसमी पट्टे पर भारी मशीनरी (ट्रैक्टर, कंबाइन हार्वेस्टर, रोटावेटर) उचित दरों पर किराए पर लें।",
    equipment: "कृषि उपकरण व औजार",
    equipmentDesc: "टपक सिंचाई (ड्रिप), उच्च-दबाव स्प्रेयर और सौर पंप उचित किराए पर उपलब्ध।",
    rentNow: "किराये पर लें",
    buySellWaste: "अवशेष खरीदें व बेचें",

    // Buyer Map Workspace
    searchPlaceholder: "जेकेएलयू के पास फसलें, किसान, मंडियां, गोदाम या सेवाएं खोजें...",
    mapFocusLabel: "नक्शा केंद्र:",
    jkluAnchorTitle: "जेके लक्ष्familyपत यूनिवर्सिटी (JKLU), महापुरा, जयपुर",
    openInGoogleMaps: "गूगल मैप्स में खोलें",
    resetToJklu: "📍 जेकेएलयू पर रीसेट करें",
    useMyLocation: "🎯 मेरी वर्तमान स्थिति",
    searchThisArea: "🔍 इस क्षेत्र में खोजें",
    radiusLabel: "खोज दायरा (रेडियस):",
    radius5km: "5 किमी",
    radius10km: "10 किमी",
    radius25km: "25 किमी (डिफ़ॉल्ट)",
    radius50km: "50 किमी",
    straightLineNote: "*दिखाई गई दूरियां नक्शे के केंद्र से सीधी रेखा की दूरी हैं।",
    filterCategoryAll: "सभी श्रेणियां",
    filterAgroWaste: "कृषि-अपशिष्ट",
    filterMachinery: "मशीनरी किराया",
    filterProduce: "फसल उपज",
    filterGooglePlaces: "गूगल प्लेसेस (आस-पास के प्रतिष्ठान)",
    filterMandis: "मंडियां और बाजार",
    sortByDistance: "क्रम: सबसे नज़दीक पहले",
    sortByPriceAsc: "कीमत: कम से अधिक",
    sortByPriceDesc: "कीमत: अधिक से कम",
    resultsCount: "परिणाम मिले",
    noResultsFound: "इस क्षेत्र में अभी कोई सक्रिय प्लेटफॉर्म लिस्टिंग नहीं है।",
    noResultsHint: "दायरा 25 किमी या 50 किमी तक बढ़ाएं, या आस-पास के गूगल प्लेसेस देखें।",

    // Layers & Data Sources
    layerPlatformListings: "🌾 प्लेटफॉर्म लिस्टिंग",
    layerMachinery: "🚜 मशीनरी",
    layerGooglePlaces: "📍 आस-पास के व्यवसाय (Google Places)",
    layerMandis: "🏛️ मंडियां (AGMARKNET)",
    layerWeather: "🌤️ मौसम (IMD)",
    layerSoil: "🌱 मृदा डेटा",
    dataSourcesStatusTitle: "लाइव डेटा स्रोतों की स्थिति",

    // Listing & Drawer Details
    viewListing: "विवरण देखें",
    addToCart: "🛒 कार्ट में जोड़ें",
    rentEquipment: "🚜 उपकरण किराए पर लें",
    requestQuote: "📝 कोटेशन मांगें",
    contactSeller: "📞 विक्रेता से संपर्क करें",
    externalPlaceLabel: "गूगल मैप्स प्रतिष्ठान (बाहरी व्यवसाय)",
    verifiedSeller: "सत्यापित प्लेटफॉर्म विक्रेता",
    unverifiedSeller: "प्लेटफॉर्म सदस्य",
    availableQuantity: "उपलब्ध मात्रा:",
    minOrderQty: "न्यूनतम आर्डर:",
    harvestDate: "कटाई तिथि:",
    ratePerDay: "/ दिन",
    ratePerWeek: "/ सप्ताह (15% छूट)",
    ratePerMonth: "/ महीना (25% छूट)",
    dailyRental: "दैनिक किराया",
    weeklyRental: "साप्ताहिक पट्टा (15% छूट)",
    monthlyRental: "मासिक पट्टा (25% छूट)",

    // Cart & Checkout
    yourCart: "आपकी कार्ट",
    cartEmpty: "आपकी कार्ट खाली है",
    cartEmptySubtext: "मार्केटप्लेस से कृषि उत्पाद जोड़ना शुरू करें।",
    continueShopping: "खरीदारी जारी रखें",
    total: "कुल योग:",
    proceedToCheckout: "ऑर्डर सबमिट करें (अनपेड अनुरोध)",
    checkoutNotice: "सूचना: भुगतान गेटवे अभी कॉन्फ़िगर नहीं है। यह विक्रेता के साथ एक लंबित अनपेड अनुरोध बनाता है।",

    // Reviews
    communityReviews: "किसान और समुदाय समीक्षाएं",
    writeReview: "समीक्षा लिखें",
    submitReview: "समीक्षा सबमिट करें",

    // Mobile View Toggle
    viewMap: "🗺️ नक्शा देखें",
    viewList: "📋 सूची देखें",

    // Statuses
    connected: "कनेक्टेड",
    setupRequired: "सेटअप आवश्यक",
    notConfigured: "कॉन्फ़िगर नहीं है",
    temporarilyUnavailable: "अस्थायी रूप से अनुपलब्ध"
  }
};

let currentLanguage = 'en';

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(lang) {
  if (lang === 'en' || lang === 'hi') {
    currentLanguage = lang;
  }
  return currentLanguage;
}

export function t(key) {
  const langDict = translations[currentLanguage] || translations.en;
  return langDict[key] || translations.en[key] || key;
}
