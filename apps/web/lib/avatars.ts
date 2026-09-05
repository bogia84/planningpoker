export interface AvatarPalette {
  id: string;
  label: string;
  base: string;
  accent: string;
  eye: string;
  bg: string;
}

export const AVATAR_PALETTES: AvatarPalette[] = [
  { id: "mint", label: "Mint", base: "#7BE0AD", accent: "#3FA37A", eye: "#1B3B32", bg: "#DFFCEF" },
  { id: "bubblegum", label: "Bubblegum", base: "#FF9ECF", accent: "#E8579F", eye: "#5A1A3C", bg: "#FFE3F1" },
  { id: "sunshine", label: "Sunshine", base: "#FFD35C", accent: "#F2A71B", eye: "#4A3300", bg: "#FFF3D0" },
  { id: "grape", label: "Grape", base: "#B392F0", accent: "#7C4DDB", eye: "#2E1854", bg: "#EDE3FF" },
  { id: "sky", label: "Sky", base: "#7FD1F5", accent: "#2FA0D6", eye: "#0E3A4D", bg: "#DFF5FF" },
  { id: "peach", label: "Peach", base: "#FFB68C", accent: "#F5824A", eye: "#5C2A0C", bg: "#FFE8D8" },
  { id: "lime", label: "Lime", base: "#C6E86B", accent: "#8FBA2B", eye: "#38460C", bg: "#F1FBD6" },
  { id: "coral", label: "Coral", base: "#FF8A80", accent: "#E5473A", eye: "#5C1410", bg: "#FFE1DD" },
  { id: "lavender", label: "Lavender", base: "#C9B6FF", accent: "#9B7BEE", eye: "#332561", bg: "#F0E9FF" },
  { id: "teal", label: "Teal", base: "#66D9C8", accent: "#22A491", eye: "#0C3E37", bg: "#DBFAF3" },
  { id: "amber", label: "Amber", base: "#FFC15E", accent: "#E68A1E", eye: "#4A2E00", bg: "#FFEECB" },
  { id: "rose", label: "Rose", base: "#FF9FB1", accent: "#E85678", eye: "#5C1626", bg: "#FFE3E9" },
];

export function findAvatarPalette(avatarId: string): AvatarPalette {
  return AVATAR_PALETTES.find((p) => p.id === avatarId) ?? AVATAR_PALETTES[0];
}

// A fixed (not random) default so server-rendered and client-hydrated markup match.
export const DEFAULT_AVATAR_ID = AVATAR_PALETTES[0].id;
