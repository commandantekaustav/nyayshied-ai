import { ClaimAnalysisResponse } from '../types/claim';

export const GOLDEN_CASE_DATA: ClaimAnalysisResponse = {
  claim_id: "NYAY-2026-HP-001",
  case_number: "CASE-HP-VICTUS-15FA-001",
  created_at: new Date().toISOString(),
  current_state: "WAITING_FOR_MANUFACTURER",
  sla_timer_hours_remaining: 48.0,
  device_image_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  invoice_sha256: "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
  triage: {
    brand_name: "HP",
    device_model: "HP Victus 15-fa1310tx",
    defect_summary: "Left display hinge torque seizure inducing tensile stress fracture and detachment of the B-cover display bezel (Part #N13327-001). Isolated cosmetic hairline scratch detected on right C-cover palmrest (Part #N13299-001).",
    primary_fault_part_code: "N13327-001",
    primary_fault_part_name: "HP Victus 15-fa B-Cover LCD Display Bezel Assembly",
    cosmetic_part_code: "N13299-001",
    bounding_boxes: [
      {
        box_2d: [735, 78, 895, 265],
        label: "Primary Left Hinge Bezel Separation & Fracture",
        oem_part_code: "N13327-001",
        part_type: "B-cover bezel",
        defect_classification: "MANUFACTURING_DEFECT",
        confidence: 0.985,
        is_user_annotated: true,
      },
      {
        box_2d: [820, 715, 875, 860],
        label: "Superficial Cosmetic Hairline Scratch (Right Palmrest)",
        oem_part_code: "N13299-001",
        part_type: "C-cover palmrest",
        defect_classification: "COSMETIC_WEAR",
        confidence: 0.942,
        is_user_annotated: false,
      },
    ],
    euclidean_separation_mm: 168.4,
    warranty_covered: true,
    causation_analysis: "Geometric separation between the cosmetic palmrest mark and the structural hinge failure is 168.4 mm (>140 mm threshold). This physical distance refutes service center claims of customer impact/drop damage. The left hinge failure is characteristic of factory hinge-overtightening (known HP Victus 15-fa chassis stress bulletin) and must be repaired under manufacturer warranty.",
    ai_authenticity: {
      is_authentic: true,
      ai_generated_probability: 0.015,
      authenticity_verdict: "AUTHENTIC_PHYSICAL_DEVICE",
      forensic_authenticity_notes: "Bayer CFA sensor noise distribution, uniform sub-pixel micro-reflections, and coherent illumination vectors verify this is an authentic physical photograph with 98.5% confidence.",
    },
    user_annotation_verification: {
      user_box_2d: [735, 78, 895, 265],
      damage_verified: true,
      component_name: "B-Cover Bezel & Left Display Hinge Pivot",
      defect_type: "Tensile Torque Hinge Fracture & Bezel Separation",
      classification: "MANUFACTURING_DEFECT",
      forensic_report: "Verification of the marked square confirms structural detachment of the B-cover inner bezel. High torque resistance in the factory-torqued left hinge bracket transferred cyclic shear force directly into the plastic clips rather than the chassis backbone, causing mechanical failure during standard lid opening cycles.",
    },
    unannotated_damages: [
      {
        box_2d: [820, 715, 875, 860],
        label: "Superficial hairline friction mark on right palmrest",
        classification: "COSMETIC_WEAR",
        separation_from_primary_mm: 168.4,
      },
    ],
    warranty_clause_analysis: {
      eligible_for_free_repair: true,
      applicable_free_repair_clause: "HP Standard Limited Warranty (Section 3.1: Material & Workmanship Structural Defect Clause) & CPA 2019 Sec 2(11)",
      damages_not_covered: [
        "Cosmetic hairline surface scratch on right palmrest (aesthetic only, non-functional)",
      ],
      legal_remedy_summary: "Entitled to 100% free OEM replacement of B-Cover Bezel Assembly (Part #N13327-001) under manufacturer statutory warranty without tying service to palmrest replacement.",
    },
    inference_latency_ms: 342.0,
  },
  pricing: {
    walk_in_quote_inr: 20000.0,
    fair_oem_cost_inr: 2500.0,
    price_gouging_multiplier: 8.0,
    excess_unjustified_inr: 17500.0,
    gouging_severity: "EXTREME_GOUGING",
    is_gouging_detected: true,
    statutory_violation: "Consumer Protection Act 2019, Section 2(47) - Unfair Trade Practice & Excessive Charging",
  },
  legal_package: {
    crm_job_sheet_demand_48h: 
      "LEGAL DEMAND & CRM JOB SHEET ESCALATION (48-HOUR NOTICE)\n" +
      "To: HP Authorized Service Center / Redington / HP India Sales Pvt Ltd\n" +
      "Reference: Invoice #SOA370366199413 | Device: HP Victus 15-fa1310tx\n\n" +
      "TAKE NOTICE that your quotation of ₹20,000/- for replacing a broken B-cover bezel (OEM Part #N13327-001, MSRP ₹2,500/-) " +
      "represents an 8.0x price-gouging markup and wrongful denial of manufacturer warranty. " +
      "Computer vision spatial analysis confirms the left hinge bezel detachment is 168.4 mm away from incidental cosmetic scratches, " +
      "conclusively establishing a manufacturing structural flaw rather than external drop impact.\n\n" +
      "You are hereby granted 48 HOURS to:\n" +
      "1. Revise Job Sheet #SOA370366199413 to ₹0.00 under standard in-warranty repair.\n" +
      "2. Confirm replacement of OEM Part #N13327-001 without tying it to unrelated assembly replacements.\n" +
      "Failure to comply within 48 hours shall trigger immediate electronic filing of a formal consumer complaint " +
      "before the District Consumer Disputes Redressal Commission via e-Jagriti / e-Daakhil under Section 35 of the Consumer Protection Act, 2019.",
    notice_english:
      "FORMAL PRE-LITIGATION LEGAL NOTICE\n" +
      "Under Section 2(11), Section 2(47), and Section 35 of the Consumer Protection Act, 2019\n\n" +
      "To:\n" +
      "1. The General Manager, Customer Support, HP India Sales Pvt Ltd.\n" +
      "2. The Branch Manager, HP Authorized Service Centre.\n\n" +
      "SUBJECT: Notice of Deficiency in Service and Unfair Trade Practice regarding HP Victus 15-fa1310tx (Invoice No: SOA370366199413).\n\n" +
      "SIRS,\n" +
      "Under instructions from our client, you are hereby put on notice:\n" +
      "1. DEFICIENCY IN SERVICE (SEC 2(11)): Your service center has arbitrarily rejected in-warranty service " +
      "by falsely attributing an inherent hinge torque failure to cosmetic palmrest scratches located 168.4 mm away.\n" +
      "2. UNFAIR TRADE PRACTICE (SEC 2(47)): Quoting ₹20,000/- for a component with an authorized OEM MRP of ₹2,500/- " +
      "constitutes extortionate commercial coercion and an 8.0x illegal markup.\n" +
      "3. STATUTORY DEMAND: You have 48 hours from the receipt of this notice to admit the claim under warranty and carry out " +
      "the repair free of charge. Failing this, proceedings under Section 35 of the Consumer Protection Act, 2019 will be instituted " +
      "on the National Consumer Portal (e-Jagriti / e-Daakhil) claiming ₹1,00,000/- for mental harassment and punitive litigation costs.",
    notice_hindi:
      "औपचारिक पूर्व-मुकदमा कानूनी नोटिस\n" +
      "उपभोक्ता संरक्षण अधिनियम, 2019 की धारा 2(11), 2(47) एवं धारा 35 के अंतर्गत\n\n" +
      "प्रेषित:\n" +
      "1. महाप्रबंधक, ग्राहक सेवा, एचपी इंडिया सेल्स प्राइवेट लिमिटेड\n" +
      "2. शाखा प्रबंधक, अधिकृत सेवा केंद्र\n\n" +
      "विषय: एचपी विक्टस 15-fa1310tx (चालान संख्या: SOA370366199413) के संबंध में सेवा में कमी और अनुचित व्यापार व्यवहार का नोटिस।\n\n" +
      "महोदय,\n" +
      "1. सेवा में कमी (धारा 2(11)): अधिकृत सेवा केंद्र द्वारा तकनीकी हिंज विफलता को दुर्भावनापूर्ण तरीके से 'उपयोगकर्ता द्वारा क्षति' बताकर वारंटी से इनकार किया गया है। फोरेंसिक इमेज विश्लेषण पुष्टि करता है कि कॉस्मेटिक खरोंच और हिंज फ्रैक्चर के बीच की दूरी 168.4 मिमी है, जो साबित करती है कि यह निर्माण दोष है।\n" +
      "2. अनुचित व्यापार व्यवहार (धारा 2(47)): मूल ओईएम पुर्जे (पार्ट #N13327-001) की वास्तविक कीमत ₹2,500/- के मुकाबले ₹20,000/- की मांग करना (8.0 गुना अधिक) अवैध और मूल्य-शोषण है।\n" +
      "3. कानूनी चेतावनी: आपको 48 घंटे का समय दिया जाता है कि इस दावे को वारंटी के अंतर्गत निःशुल्क स्वीकार करें। अनुपालन न होने पर उपभोक्ता संरक्षण अधिनियम 2019 की धारा 35 के तहत ई-जागृति पोर्टल पर जिला आयोग के समक्ष वाद दायर किया जाएगा।",
    notice_bengali:
      "আনুষ্ঠানিক প্রাক-মামলা আইনি নোটিশ\n" +
      "উপভোক্তা সুরক্ষা আইন, ২০১৯ এর ধারা ২(১১), ২(৪৭) এবং ধারা ৩৫-এর অধীনে\n\n" +
      "প্রাপক:\n" +
      "১. জেনারেল ম্যানেজার, কাস্টমার সার্ভিস, এইচপি ইন্ডিয়া সেলস প্রাইভেট লিমিটেড\n" +
      "২. ব্রাঞ্চ ম্যানেজার, অনুমোদিত সার্ভিস সেন্টার\n\n" +
      "বিষয়: এইচপি ভিকটাস 15-fa1310tx (ইনভয়েস নং: SOA370366199413) সংক্রান্ত সেবার ঘাটতি এবং অন্যায্য বাণিজ্যিক আচরণের আইনি নোটিশ।\n\n" +
      "মহাশয়,\n" +
      "১. সেবায় ঘাটতি (ধারা ২(১১)): সার্ভিস সেন্টার সম্পূর্ণ অন্যায়ভাবে কাঠামোগত কব্জা বিকলকে গ্রাহকের দ্বারা ড্রপ ড্যামেজ বলে দাবি করে ওয়ারেন্টি বাতিল করেছে। ছবি বিশ্লেষণ স্পষ্টভাবে প্রমাণ করে যে কব্জা এবং সামান্য স্ক্র্যাচের দূরত্ব ১৬৮.৪ মিমি, যা উৎপাদনজনিত ক্রুটির সাক্ষ্য দেয়।\n" +
      "২. অন্যায্য বাণিজ্যিক আচরণ (ধারা ২(৪৭)): আসল যন্ত্রাংশের (পার্ট #N13327-001) ন্যায্য মূল্য ₹২,৫০০/- হওয়া সত্ত্বেও সার্ভিস সেন্টারের ₹২০,০০০/- দাবি করা (৮.০ গুণ অতিরিক্ত) বেআইনি এবং মূল্য-শোষণ।\n" +
      "৩. আইনি দাবি: আগামী ৪৮ ঘণ্টার মধ্যে এই দাবিপত্র ওয়ারেন্টির অধীনে গ্রহণ করে বিনামূল্যে মেরামতের নির্দেশ দিন। অন্যথায় উপভোক্তা সুরক্ষা আইন ২০১৯-এর ধারা ৩৫ অনুসারে জাতীয় ই-জাগৃতি পোর্টালের মাধ্যমে জেলা উপভোক্তা কমিশনে আইনি পদক্ষেপ গ্রহণ করা হবে।",
    statutory_citations: [
      "Consumer Protection Act 2019, Section 2(11) [Deficiency in Service]",
      "Consumer Protection Act 2019, Section 2(47) [Unfair Trade Practice]",
      "Consumer Protection Act 2019, Section 35 [District Commission e-Jagriti Complaint]",
      "Consumer Protection (E-Commerce) Rules 2020, Rule 5 [Duties of Sellers]"
    ],
    gemma3_judge_verified: true,
    critic_verification_notes: "Gemma 3 Adversarial Critic verification completed. Statutory citations cross-checked against India Gazette CPA 2019 official acts. Verified 0% hallucinated citations. Pre-litigation notices fully actionable under Section 35 e-Jagriti procedure.",
  },
  state_loop: [
    {
      state: "DEFECT_DETECTED",
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
      description: "Spatial vision localized B-cover bezel fracture (Part #N13327-001) and C-cover scratch (Part #N13299-001).",
    },
    {
      state: "EVIDENCE_LOCKED",
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
      description: "Cryptographic SHA-256 frame hash locked: e3b0c44298fc1c14... Non-repudiation established.",
    },
    {
      state: "QUOTE_AUDITED",
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
      description: "Price gouging audited: ₹20,000 vs ₹2,500 fair OEM cost (8.0x multiplier). Flagrant violation flagged.",
    },
    {
      state: "DEMAND_ISSUED",
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
      description: "48-Hour CRM Job Sheet Demand & Tri-lingual e-Jagriti Section 35 legal package compiled. Critic verified by Gemma 3.",
    },
    {
      state: "WAITING_FOR_MANUFACTURER",
      status: "ACTIVE",
      timestamp: new Date().toISOString(),
      description: "Active 48.0 hour SLA countdown window. Awaiting manufacturer/service center compliance.",
    },
    {
      state: "ESCALATED_E_JAGRITI",
      status: "PENDING",
      timestamp: "Pending SLA Expiration (48h)",
      description: "Automated digital filing to e-Jagriti (National Consumer Disputes Redressal Commission) upon SLA breach.",
    },
  ],
  fernet_encrypted_telemetry: "gAAAAABnh1L23...[FERNET_AES128_HMAC_ENCRYPTED_TELEMETRY_RECORD]",
  audit_logs: [
    {
      timestamp: new Date().toISOString(),
      action: "SPATIAL_DEFECT_TRIAGE",
      latency_ms: 342.0,
      model_used: "gemini-3.5-flash",
      details: "Analyzed uploaded frame with 2D bounding boxes and user annotation verification.",
    },
    {
      timestamp: new Date().toISOString(),
      action: "AI_FAKE_IMAGE_CHECK",
      latency_ms: 120.0,
      model_used: "gemini-3.5-flash",
      details: "Confirmed authentic camera capture (0.015 AI synthetic score).",
    },
    {
      timestamp: new Date().toISOString(),
      action: "PRICE_GOUGING_AUDIT",
      latency_ms: 18.0,
      model_used: "deterministic-rules-engine",
      details: "Calculated 8.0x price gouging markup (demanded ₹20,000 vs fair ₹2,500).",
    },
    {
      timestamp: new Date().toISOString(),
      action: "CRITIC_VERIFICATION",
      latency_ms: 280.0,
      model_used: "gemma-3-judge",
      details: "Verified statutory citations: 0% hallucinations under CPA 2019.",
    },
  ],
};

// Generates a mock laptop image with visible hinge defect and scratch for offline canvas
export function generateLaptopSampleImage(): string {
  // SVG of a stylized gaming laptop chassis (HP Victus) with keyboard and screen
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="#0b1120">
    <rect width="800" height="600" fill="#090d16" />
    
    <!-- Laptop Base / C-Cover (Dark Gunmetal) -->
    <rect x="80" y="240" width="640" height="320" rx="16" fill="#131b2e" stroke="#1e293b" stroke-width="4" />
    
    <!-- Keyboard Deck -->
    <rect x="130" y="270" width="540" height="180" rx="8" fill="#0a0f1d" stroke="#1e293b" stroke-width="2" />
    <!-- Trackpad -->
    <rect x="310" y="465" width="180" height="85" rx="6" fill="#0f172a" stroke="#334155" stroke-width="2" />
    
    <!-- Open Display Lid / B-Cover & Bezel (Upwards) -->
    <polygon points="120,60 680,60 700,240 100,240" fill="#070a13" stroke="#334155" stroke-width="3" />
    <!-- Display Screen -->
    <polygon points="140,80 660,80 675,225 125,225" fill="#0284c7" fill-opacity="0.1" stroke="#0369a1" stroke-width="1.5" />
    <text x="400" y="150" fill="#38bdf8" font-size="20" font-family="monospace" text-anchor="middle" font-weight="bold">DEVICE HARDWARE DEFECT INSPECTION</text>
    <text x="400" y="180" fill="#94a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">Physical Optical Capture • NyayShield AI Forensic Engine</text>
    
    <!-- Left Display Hinge Zone (STRUCTURAL FAILURE) -->
    <rect x="100" y="225" width="60" height="35" rx="4" fill="#1e293b" />
    <!-- Bezel Crack Graphic (Zig-zag crack in crimson/amber) -->
    <path d="M 115 228 L 125 240 L 120 250 L 132 258" stroke="#ef4444" stroke-width="4" fill="none" />
    <!-- Gap / detached bezel -->
    <polygon points="110,230 145,232 140,252 108,248" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,2" />
    
    <!-- Right Display Hinge Zone (Intact) -->
    <rect x="640" y="225" width="60" height="35" rx="4" fill="#1e293b" stroke="#334155" />
    
    <!-- Superficial Cosmetic Hairline Scratch on Right Palmrest -->
    <path d="M 580 490 Q 610 500 645 495" stroke="#f59e0b" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <circle cx="612" cy="495" r="4" fill="#f59e0b" fill-opacity="0.4" />
    
    <!-- Subtle Logo -->
    <path d="M 400 360 L 380 320 L 395 320 L 400 335 L 405 320 L 420 320 Z" fill="#38bdf8" fill-opacity="0.6" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
