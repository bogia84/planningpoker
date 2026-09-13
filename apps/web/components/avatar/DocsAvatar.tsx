import { findAvatarCharacter, type AvatarCharacter } from "@/lib/avatars";

function AvatarIcon({ character }: { character: AvatarCharacter }) {
  const c = character.colors;

  switch (character.id) {
    case "hero":
      return (
        <>
          <circle cx={20} cy={22} r={11} fill={c["1"]} />
          <path d="M9,19 Q20,12 31,19 L31,23 Q20,17 9,23 Z" fill={c["3"]} />
          <polygon points="13,14 16,6 19,14" fill={c["3"]} />
          <polygon points="21,14 24,6 27,14" fill={c["3"]} />
          <circle cx={15} cy={20} r={1.6} fill="#fff" />
          <circle cx={25} cy={20} r={1.6} fill="#fff" />
          <path d="M15,27 Q20,30 25,27" stroke={c["2"]} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </>
      );
    case "turtle":
      return (
        <>
          <ellipse cx={20} cy={19} rx={13} ry={11} fill={c["3"]} />
          <line x1={20} y1={9} x2={20} y2={29} stroke={c["2"]} strokeWidth={1} opacity={0.45} />
          <line x1={8.5} y1={19} x2={31.5} y2={19} stroke={c["2"]} strokeWidth={1} opacity={0.45} />
          <circle cx={20} cy={32} r={5.5} fill={c["1"]} />
          <circle cx={18} cy={32} r={1} fill={c["2"]} />
          <circle cx={22} cy={32} r={1} fill={c["2"]} />
        </>
      );
    case "ghost":
      return (
        <>
          <path
            d="M10,32 L10,18 Q10,8 20,8 Q30,8 30,18 L30,32 L26,28 L22,32 L18,28 L14,32 Z"
            fill={c["3"]}
          />
          <ellipse cx={15} cy={18} rx={1.8} ry={2.4} fill={c["2"]} />
          <ellipse cx={25} cy={18} rx={1.8} ry={2.4} fill={c["2"]} />
          <circle cx={20} cy={23} r={1.6} fill={c["2"]} />
        </>
      );
    case "robot":
      return (
        <>
          <line x1={20} y1={14} x2={20} y2={9} stroke={c["2"]} strokeWidth={2} />
          <circle cx={20} cy={7} r={2} fill={c["3"]} />
          <rect x={10} y={14} width={20} height={18} rx={4} fill={c["1"]} />
          <circle cx={15.5} cy={22} r={2.2} fill={c["2"]} />
          <circle cx={24.5} cy={22} r={2.2} fill={c["2"]} />
          <rect x={14} y={27} width={12} height={3} rx={1.5} fill={c["2"]} />
        </>
      );
    case "slime":
      return (
        <>
          <path
            d="M20,10 C28,10 32,20 32,26 C32,32 26,35 20,35 C14,35 8,32 8,26 C8,20 12,10 20,10 Z"
            fill={c["1"]}
          />
          <ellipse cx={15} cy={18} rx={2} ry={3} fill={c["3"]} opacity={0.7} />
          <circle cx={16} cy={24} r={1.8} fill={c["2"]} />
          <circle cx={24} cy={24} r={1.8} fill={c["2"]} />
          <path d="M16,29 Q20,32 24,29" stroke={c["2"]} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </>
      );
    case "cactus":
      return (
        <>
          <path d="M12,34 L28,34 L26,38 L14,38 Z" fill={c["4"]} />
          <rect x={8} y={18} width={6} height={10} rx={3} fill={c["1"]} />
          <rect x={26} y={16} width={6} height={10} rx={3} fill={c["1"]} />
          <rect x={15} y={14} width={10} height={20} rx={5} fill={c["1"]} />
          <circle cx={20} cy={11} r={3} fill={c["3"]} />
          <circle cx={18} cy={22} r={1} fill={c["2"]} />
          <circle cx={22} cy={22} r={1} fill={c["2"]} />
        </>
      );
    case "alien":
      return (
        <>
          <path d="M12,22 Q12,10 20,10 Q28,10 28,22 Z" fill={c["4"]} opacity={0.9} />
          <ellipse cx={20} cy={22} rx={14} ry={5} fill={c["1"]} />
          <circle cx={12} cy={23} r={1.2} fill={c["3"]} />
          <circle cx={20} cy={25} r={1.2} fill={c["3"]} />
          <circle cx={28} cy={23} r={1.2} fill={c["3"]} />
        </>
      );
    case "ninja-cat":
      return (
        <>
          <polygon points="10,14 14,4 18,13" fill={c["3"]} />
          <polygon points="22,13 26,4 30,14" fill={c["3"]} />
          <circle cx={20} cy={22} r={11} fill={c["3"]} />
          <rect x={9} y={17} width={22} height={7} rx={3} fill={c["1"]} />
          <ellipse cx={15} cy={20.5} rx={2} ry={2.6} fill={character.bg} />
          <ellipse cx={25} cy={20.5} rx={2} ry={2.6} fill={character.bg} />
          <circle cx={15} cy={21} r={1} fill={c["1"]} />
          <circle cx={25} cy={21} r={1} fill={c["1"]} />
          <polygon points="18.5,27 21.5,27 20,29" fill={c["4"]} />
        </>
      );
    case "dino":
      return (
        <>
          <polygon points="16,14 18,8 20,14" fill={c["3"]} />
          <polygon points="22,12 24,6 26,12" fill={c["3"]} />
          <polygon points="28,14 30,9 32,15" fill={c["3"]} />
          <path
            d="M10,28 Q8,18 18,14 Q28,10 33,18 Q35,24 30,28 Q28,32 20,32 Q12,32 10,28 Z"
            fill={c["1"]}
          />
          <circle cx={26} cy={19} r={1.8} fill={c["2"]} />
        </>
      );
    case "watermelon":
      return (
        <>
          <path d="M8,22 A12,12 0 0 1 32,22 Z" fill={c["1"]} />
          <path d="M9.5,22 A10.5,10.5 0 0 1 30.5,22 Z" fill={c["4"]} />
          <path d="M11,22 A9,9 0 0 1 29,22 Z" fill={c["3"]} />
          <circle cx={14} cy={19.5} r={1} fill={c["2"]} />
          <circle cx={20} cy={17.5} r={1} fill={c["2"]} />
          <circle cx={26} cy={19.5} r={1} fill={c["2"]} />
        </>
      );
    case "star":
      return (
        <>
          <polygon
            points="20,7 23.06,15.79 32.36,15.98 24.95,21.61 27.64,30.52 20,25.2 12.36,30.52 15.05,21.61 7.64,15.98 16.94,15.79"
            fill={c["1"]}
          />
          <circle cx={14} cy={22} r={1.5} fill={c["3"]} opacity={0.6} />
          <circle cx={26} cy={22} r={1.5} fill={c["3"]} opacity={0.6} />
          <circle cx={17} cy={20} r={1.3} fill={c["2"]} />
          <circle cx={23} cy={20} r={1.3} fill={c["2"]} />
          <path d="M17,24 Q20,26.5 23,24" stroke={c["2"]} strokeWidth={1.3} fill="none" strokeLinecap="round" />
        </>
      );
    case "knight":
      return (
        <>
          <path d="M20,10 Q17,4 20,2 Q23,4 20,10 Z" fill={c["3"]} />
          <path d="M9,26 Q9,10 20,10 Q31,10 31,26 L31,30 Q20,34 9,30 Z" fill={c["1"]} />
          <rect x={11} y={19} width={18} height={4} rx={2} fill={c["2"]} />
          <circle cx={13} cy={24} r={1.2} fill={c["4"]} />
        </>
      );
    default:
      return <circle cx={20} cy={20} r={11} fill={c["1"]} />;
  }
}

export function DocsAvatar({ avatarId, size = 48 }: { avatarId: string; size?: number }) {
  const character = findAvatarCharacter(avatarId);

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      role="img"
      aria-label={`${character.label} avatar`}
      style={{ display: "block", borderRadius: "9999px" }}
    >
      <circle cx={20} cy={20} r={20} fill={character.bg} />
      <AvatarIcon character={character} />
    </svg>
  );
}
