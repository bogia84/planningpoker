export interface AvatarCharacter {
  id: string;
  label: string;
  bg: string;
  colors: Record<string, string>;
  grid: string[];
}

export const AVATAR_CHARACTERS: AvatarCharacter[] = [
  {
    id: "hero",
    label: "Cap Hero",
    bg: "#FFE8D8",
    colors: { "1": "#FFCBA1", "2": "#3A2416", "3": "#E5473A", "4": "#FFD35C" },
    grid: [
      "00333300",
      "03333330",
      "33333333",
      "01122110",
      "01111110",
      "00122100",
      "00111100",
      "00101000",
    ],
  },
  {
    id: "turtle",
    label: "Shellback",
    bg: "#DFFCEF",
    colors: { "1": "#7BE0AD", "2": "#1B3B32", "3": "#3FA37A", "4": "#C6E86B" },
    grid: [
      "00111100",
      "01211210",
      "13333331",
      "13434331",
      "13343431",
      "13333331",
      "01111110",
      "00202000",
    ],
  },
  {
    id: "ghost",
    label: "Boo",
    bg: "#F0E9FF",
    colors: { "1": "#EDE7FF", "2": "#332561", "3": "#9B7BEE" },
    grid: [
      "00111100",
      "01111110",
      "11122111",
      "11111111",
      "11111111",
      "11133111",
      "11111111",
      "10101010",
    ],
  },
  {
    id: "robot",
    label: "Bit Bot",
    bg: "#DFF5FF",
    colors: { "1": "#9FB4C7", "2": "#0E3A4D", "3": "#E5473A", "4": "#DFF5FF" },
    grid: [
      "00030000",
      "00111000",
      "01111110",
      "12222210",
      "11441110",
      "01111110",
      "00111100",
      "01000010",
    ],
  },
  {
    id: "slime",
    label: "Slime",
    bg: "#E3F7FF",
    colors: { "1": "#66D9C8", "2": "#0C3E37", "3": "#C6E86B" },
    grid: [
      "00000000",
      "00111100",
      "01111110",
      "11122111",
      "11111311",
      "11111111",
      "01111110",
      "00111100",
    ],
  },
  {
    id: "cactus",
    label: "Prickle",
    bg: "#F1FBD6",
    colors: { "1": "#8FBA2B", "2": "#38460C", "3": "#FF9ECF", "4": "#B5732A" },
    grid: [
      "00030000",
      "00111000",
      "01111110",
      "21111112",
      "01211210",
      "01111110",
      "00111100",
      "00444400",
    ],
  },
  {
    id: "alien",
    label: "Saucer",
    bg: "#EDE3FF",
    colors: { "1": "#B392F0", "2": "#2E1854", "3": "#FFD35C", "4": "#D8CBFF" },
    grid: [
      "00111100",
      "01211210",
      "11111111",
      "31313131",
      "01111110",
      "00444400",
      "00040000",
      "00000000",
    ],
  },
  {
    id: "ninja-cat",
    label: "Ninja Cat",
    bg: "#FFE3F1",
    colors: { "1": "#3B3B45", "2": "#FFD35C", "3": "#FF9ECF", "4": "#E5473A" },
    grid: [
      "01000010",
      "11000011",
      "01111110",
      "01211210",
      "01111110",
      "00114100",
      "00111100",
      "00101000",
    ],
  },
  {
    id: "dino",
    label: "Rex",
    bg: "#FFEECB",
    colors: { "1": "#F5824A", "2": "#5C2A0C", "3": "#2F5D1E", "4": "#FFE8D8" },
    grid: [
      "03030300",
      "01111100",
      "11122110",
      "11111110",
      "01444110",
      "01111110",
      "00111100",
      "00100100",
    ],
  },
  {
    id: "watermelon",
    label: "Melon",
    bg: "#FFE1DD",
    colors: { "1": "#3FA37A", "2": "#1B3B32", "3": "#FF6F91", "4": "#FFB6C8" },
    grid: [
      "00111100",
      "01333310",
      "13323231",
      "13333331",
      "13232331",
      "01333310",
      "00111100",
      "00010000",
    ],
  },
  {
    id: "star",
    label: "Star Kid",
    bg: "#FFF3D0",
    colors: { "1": "#FFD35C", "2": "#4A3300", "3": "#F2A71B" },
    grid: [
      "00011000",
      "00111100",
      "01111110",
      "01211210",
      "11111111",
      "01111110",
      "10111101",
      "01000010",
    ],
  },
  {
    id: "knight",
    label: "Sir Pixel",
    bg: "#E7EEF5",
    colors: { "1": "#2FA0D6", "2": "#0E3A4D", "3": "#E5473A", "4": "#F0F4F8" },
    grid: [
      "00133100",
      "01111110",
      "11144111",
      "12222210",
      "11111110",
      "01111100",
      "00111000",
      "00010000",
    ],
  },
];

export function findAvatarCharacter(avatarId: string): AvatarCharacter {
  return AVATAR_CHARACTERS.find((a) => a.id === avatarId) ?? AVATAR_CHARACTERS[0];
}

// A fixed (not random) default so server-rendered and client-hydrated markup match.
export const DEFAULT_AVATAR_ID = AVATAR_CHARACTERS[0].id;
