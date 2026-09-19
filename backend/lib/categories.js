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
    programIds: ["npower", "3mtt", "njfp"],
  },
  {
    key: "business",
    label: "Business/Funding",
    icon: "💰",
    programIds: ["geep_tradermoni", "geep_marketmoni", "geep_farmermoni"],
  },
  {
    key: "women_family",
    label: "Women & Family",
    icon: "👩‍👧",
    programIds: ["geep_marketmoni"],
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
    programIds: ["npower", "3mtt", "njfp"],
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
