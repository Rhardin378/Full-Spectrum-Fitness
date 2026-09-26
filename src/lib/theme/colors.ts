/** Locked brand palette — see docs/brand_style_guide.md */
export const colors = {
  surfaceHeader: "#1E1E1E",
  surfacePage: "#F5F3F0",
  surfaceCard: "#FFFFFF",
  brandCoral: "#E85A4F",
  brandCoralDeep: "#D14A40",
  brandCoralDark: "#C9453A",
  brandCoralLight: "#FFD4CC",
  textPrimary: "#1A1A1A",
  textMuted: "#6B6560",
  textOnDark: "#FFFFFF",
  textOnDarkMuted: "#A3A3A3",
  success: "#4ADE80",
  feedbackError: "#C9453A",
  feedbackErrorBg: "#FFF5F3",
  feedbackSuccessBg: "#ECFDF5",
  feedbackSuccessText: "#166534",
} as const;

export const gradients = {
  welcome:
    "linear-gradient(90deg, #C9453A 0%, #E85A4F 50%, #FFD4CC 100%)",
  authBackground:
    "linear-gradient(135deg, #1E1E1E 0%, #3D2520 40%, #E85A4F 70%, #FFD4CC 100%)",
} as const;
