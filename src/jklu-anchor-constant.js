// src/jklu-anchor-constant.js
// Single source of truth for the verified JKLU anchor as required by Section 2:
// Official source: https://jklu.edu.in/contact-us

export const jkluAnchorData = {
  name: "JK Lakshmipat University (JKLU)",
  officialAddress: "Near Mahindra SEZ, P.O. Mahapura Ajmer Road, Jaipur – 302026, Rajasthan, India.",
  locality: "Mahapura",
  subDistrict: "Sanganer",
  city: "Jaipur",
  district: "Jaipur",
  state: "Rajasthan",
  pincode: "302026",
  country: "India",
  // Geocoded coordinates of JKLU campus at Mahapura, off Ajmer Road
  latitude: 26.8378,
  longitude: 75.6499,
  campusContext: "Spread over 30 acres in Mahapura off Ajmer Road, approximately 25 km from the heart of Jaipur.",
  officialSourceUrl: "https://jklu.edu.in/contact-us",
  coordinateSource: "Official JKLU Mahapura Campus Address & Verified Geographic Coordinates",
  verifiedAt: "2026-10-25T00:00:00+05:30",
  defaultRadiusKm: 25,
  allowedRadiiKm: [5, 10, 25, 50]
};
