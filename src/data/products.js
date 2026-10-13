/**
 * Odd Frequency - Product Catalog
 * 
 * Central data repository for all design concepts across THE VOID and THE FEED.
 * To add, edit, or remove designs, simply update this file.
 */

export const PRODUCTS = [
  // --- THE VOID COLLECTION ---
  {
    id: "OF-001",
    name: "MORTAL DIALECT ACID TEE",
    collection: "THE VOID",
    collectionSlug: "void",
    category: "Oversized Tees",
    fit: "Boxy Heavyweight Drop-Shoulder",
    indicativePrice: 1499,
    currency: "₹",
    priceLabel: "₹1,499 (Indicative Concept Price)",
    image: "images/void-acid-tee.jpg",
    accentColor: "#9b1b30",
    tags: ["Distressed Hem", "280 GSM Cotton", "Cyber-Sigilism"],
    conceptSummary: "An existential study in underground noise. Custom raw-edge distressing with cyber-sigilism typography reflecting the dissonant hum of post-industrial youth.",
    fabricSpecs: [
      "280 GSM 100% combed French Terry cotton",
      "Individually hand-distressed collar & hem",
      "Specialty acid charcoal mineral wash",
      "Breathable weave optimized for humid Indian climates",
      "Reinforced double-needle seam construction"
    ],
    seedVotes: 238,
    isFeatured: true
  },
  {
    id: "OF-002",
    name: "CYBER-SIGIL METALLIC LONGSLEEVE",
    collection: "THE VOID",
    collectionSlug: "void",
    category: "Longsleeves",
    fit: "Relaxed Straight Cut",
    indicativePrice: 1799,
    currency: "₹",
    priceLabel: "₹1,799 (Indicative Concept Price)",
    image: "images/void-longsleeve.jpg",
    accentColor: "#80142a",
    tags: ["Arm Sleeves Graphic", "260 GSM Ribbed", "Goth Industrial"],
    conceptSummary: "Continuous sleeve sigil glyphs inspired by underground black metal logos and esoteric terminal code. Heavy ribbed cuffs that stack cleanly above sneakers.",
    fabricSpecs: [
      "260 GSM single jersey cotton with slight stretch",
      "Silkscreen discharge print (zero plastic handfeel)",
      "Ribbed 1x1 collar and wrist cuffs",
      "Pre-shrunk fabric to prevent post-wash warping",
      "Deep charcoal fade finish"
    ],
    seedVotes: 184,
    isFeatured: false
  },
  {
    id: "OF-003",
    name: "VERTEBRAE CYBER-GOTH ZIP HOODIE",
    collection: "THE VOID",
    collectionSlug: "void",
    category: "Hoodies",
    fit: "Oversized Heavyweight Silhouette",
    indicativePrice: 2899,
    currency: "₹",
    priceLabel: "₹2,899 (Indicative Concept Price)",
    image: "images/void-hoodie.jpg",
    accentColor: "#9b1b30",
    tags: ["380 GSM Fleece", "Antique Silver Hardware", "Spine Sigil"],
    conceptSummary: "Split spine graphic aligned down the center zip track. Lined with muted burgundy jersey fleece, engineered with an exaggerated hood drape and raw seam fraying.",
    fabricSpecs: [
      "380 GSM ultra-heavy loopback French Terry fleece",
      "Custom antique oxidized gunmetal YKK two-way zipper",
      "Interior hood lined with deep wine red cotton",
      "Drop-shoulder tailoring with thumbhole cuffs",
      "Enzyme-stone washed for vintage lived-in handfeel"
    ],
    seedVotes: 312,
    isFeatured: true
  },
  {
    id: "OF-004",
    name: "UNDERGROUND ARCHIVE PARKA LOOK",
    collection: "THE VOID",
    collectionSlug: "void",
    category: "Oversized Tees",
    fit: "Subterranean Relaxed",
    indicativePrice: 1599,
    currency: "₹",
    priceLabel: "₹1,599 (Indicative Concept Price)",
    image: "images/void-hero.jpg",
    accentColor: "#701224",
    tags: ["Distressed Punk", "Heavy Mineral Dye", "Signature Drop"],
    conceptSummary: "The flagship visual identity garment of The Void. Designed to be layered under unbuttoned heavy shirts or oversized trenches, worn till the threads dissolve.",
    fabricSpecs: [
      "300 GSM open-end spun vintage cotton",
      "Frayed collar ribbing and micro-punctures",
      "Distressed typography on chest and back",
      "Cold water wash safe, color-fast charcoal dyes"
    ],
    seedVotes: 295,
    isFeatured: false
  },

  // --- THE FEED COLLECTION ---
  {
    id: "OF-005",
    name: "POWER-SAVING MODE BOBA TEE",
    collection: "THE FEED",
    collectionSlug: "feed",
    category: "Oversized Tees",
    fit: "Boxy Vintage Skater Fit",
    indicativePrice: 1299,
    currency: "₹",
    priceLabel: "₹1,299 (Indicative Concept Price)",
    image: "images/feed-power-tee.jpg",
    accentColor: "#b8ff00",
    tags: ["Ironic Meme", "240 GSM Soft Combed", "Electric Lime"],
    conceptSummary: "For the chronically exhausted. Features an unbothered pixel cat sipping matcha boba while the energy reserves sit permanently at 3%. Ironic anti-hustle uniform.",
    fabricSpecs: [
      "240 GSM bio-washed 100% ring-spun cotton",
      "High-contrast silk-screen print with neon-reactive lime",
      "Drop shoulder boxy silhouette",
      "Durable non-curling 1.25 inch neck ribbing",
      "Super soft vintage enzyme wash"
    ],
    seedVotes: 341,
    isFeatured: true
  },
  {
    id: "OF-006",
    name: "NOT READING ALL THAT BABY TEE",
    collection: "THE FEED",
    collectionSlug: "feed",
    category: "Baby Tees",
    fit: "Fitted 90s Cropped Cut",
    indicativePrice: 999,
    currency: "₹",
    priceLabel: "₹999 (Indicative Concept Price)",
    image: "images/feed-baby-tee.jpg",
    accentColor: "#a3e635",
    tags: ["Baby Tee", "Contrast Ringer", "TL;DR Culture"],
    conceptSummary: "The definitive answer to multi-paragraph relationship essays and unprompted WhatsApp group sermons. Fitted 90s cropped silhouette with contrast lime ringer borders.",
    fabricSpecs: [
      "190 GSM ribbed stretch cotton (95% cotton / 5% elastane)",
      "Contrasting lime green and black neck/sleeve ringers",
      "Tailored baby tee crop sitting exactly above waistband",
      "Digitized pixel font graphic with miniature loading bar",
      "Pre-shrunk for consistent fit through washes"
    ],
    seedVotes: 418,
    isFeatured: true
  },
  {
    id: "OF-007",
    name: "BUFFERING EXISTENCE STREET TEE",
    collection: "THE FEED",
    collectionSlug: "feed",
    category: "Oversized Tees",
    fit: "Loose Streetwear Drop",
    indicativePrice: 1399,
    currency: "₹",
    priceLabel: "₹1,399 (Indicative Concept Price)",
    image: "images/feed-buffering-tee.jpg",
    accentColor: "#d4ff00",
    tags: ["Glitch Pixel", "250 GSM Cream Cotton", "Cyber Pop"],
    conceptSummary: "High-contrast digital glitch graphic celebrating cognitive overload and 40 open browser tabs. Printed on warm unbleached natural cotton.",
    fabricSpecs: [
      "250 GSM untreated raw unbleached natural cotton",
      "Dithering glitch print technique",
      "Generous sleeve length hitting below elbow",
      "Reinforced shoulder-to-shoulder taped seams",
      "Machine washable with cold dry recommendation"
    ],
    seedVotes: 267,
    isFeatured: false
  },
  {
    id: "OF-008",
    name: "CYBER-POP SPAM CAT BABY TEE",
    collection: "THE FEED",
    collectionSlug: "feed",
    category: "Baby Tees",
    fit: "Fitted Y2K Crop",
    indicativePrice: 1099,
    currency: "₹",
    priceLabel: "₹1,099 (Indicative Concept Price)",
    image: "images/feed-hero.jpg",
    accentColor: "#84cc16",
    tags: ["Y2K Revival", "Pixel Mascot", "Flash Style"],
    conceptSummary: "Flash-photography energy captured on textile. 1998 internet spam icon recreated as a neon-green statement badge for high-contrast casual styling.",
    fabricSpecs: [
      "200 GSM combed cotton rib with soft handfeel",
      "Retro ringer contrast trim",
      "Glossy screenprint with textured glitter highlight",
      "Ethically milled local cotton"
    ],
    seedVotes: 389,
    isFeatured: false
  }
];

export const CATEGORIES = [
  "All",
  "Oversized Tees",
  "Baby Tees",
  "Hoodies",
  "Longsleeves"
];

export const FITS = [
  "All Fits",
  "Boxy Heavyweight Drop-Shoulder",
  "Fitted 90s Cropped Cut",
  "Oversized Heavyweight Silhouette",
  "Relaxed Straight Cut"
];
