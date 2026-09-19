export const categories = [
  {
    key: "education",
    label: "Education",
    icon: "🎓",
    programIds: [
      "nelfund",
      "federal_scholarship_board",
      "mtn_foundation_scholarship",
      "ptdf_scholarship",
      "nnpc_chevron_scholarship",
      "shell_spdc_scholarship",
    ],
  },
  {
    key: "employment",
    label: "Job",
    icon: "💼",
    programIds: [
      "npower",
      "3mtt",
      "njfp",
      "mtn_graduate_programme",
      "uba_gmap",
      "ecobank_eldp",
      "access_bank_eltp",
      "microsoft_adc_internship",
      "flutterwave_graduate_trainee",
      "deloitte_nigeria_graduate_trainee",
    ],
  },
  {
    key: "business",
    label: "Business/Funding",
    icon: "💰",
    programIds: [
      "geep_tradermoni",
      "geep_marketmoni",
      "geep_farmermoni",
      "jaiz_bank_msme",
      "tajbank_business_financing",
      "boi_sme_loan",
      "boi_glow",
    ],
  },
  {
    key: "women_family",
    label: "Women & Family",
    icon: "👩‍👧",
    programIds: ["geep_marketmoni", "boi_glow"],
  },
  {
    key: "agriculture",
    label: "Agriculture",
    icon: "🌾",
    programIds: ["geep_farmermoni"],
  },
  {
    key: "youth",
    label: "Youth Opportunities",
    icon: "🚀",
    programIds: [
      "npower",
      "3mtt",
      "njfp",
      "mtn_graduate_programme",
      "uba_gmap",
      "ecobank_eldp",
      "access_bank_eltp",
      "microsoft_adc_internship",
      "flutterwave_graduate_trainee",
      "deloitte_nigeria_graduate_trainee",
    ],
  },
];

export const UNKNOWN_CATEGORY = {
  key: "unknown",
  label: "I don't know — help me find out",
  icon: "🔍",
  programIds: [],
};

export function findCategory(key) {
  return categories.find((c) => c.key === key) || UNKNOWN_CATEGORY;
}
