/** Original decorative automotive drawings. Position and motion are owned by CSS. */
type PartType = "brake-disc" | "piston" | "wipers" | "wheel" | "spring";

function polar(radius: number, angle: number): string {
  return `${(80 + Math.cos(angle) * radius).toFixed(2)} ${(80 + Math.sin(angle) * radius).toFixed(2)}`;
}

function circularHoles(
  count: number,
  radius: number,
  hole: number,
  offset = 0,
): string {
  return Array.from({ length: count }, (_, i) => {
    const [cx, cy] = polar(radius, offset + (i / count) * Math.PI * 2).split(
      " ",
    );
    return `<circle cx="${cx}" cy="${cy}" r="${hole}"/>`;
  }).join("");
}

const brakeDisc = `
  <circle cx="80" cy="80" r="60"/>
  <circle cx="80" cy="80" r="55"/>
  <circle cx="80" cy="80" r="29"/>
  <circle cx="80" cy="80" r="23"/>
  <circle cx="80" cy="80" r="7"/>
  ${circularHoles(5, 16, 3, -Math.PI / 2)}
  <g stroke-opacity=".72">
    ${circularHoles(12, 47, 2, Math.PI / 24)}
    ${circularHoles(12, 37, 2, Math.PI / 12)}
  </g>
  <g stroke-opacity=".5">${Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    return `<path d="M${polar(56.5, angle)}L${polar(59.5, angle + 0.018)}"/>`;
  }).join("")}</g>`;

const piston = `
  <ellipse cx="80" cy="24" rx="30" ry="7"/>
  <path d="M50 24V61C50 73 110 73 110 61V24"/>
  <path d="M50 33C64 41 96 41 110 33M50 40C64 48 96 48 110 40"/>
  <circle cx="80" cy="57" r="9"/>
  <circle cx="80" cy="57" r="3" stroke-opacity=".65"/>
  <path d="M71 70L67 111A21 21 0 1 0 93 111L89 70"/>
  <path d="M75 76V108M85 76V108" stroke-opacity=".6"/>
  <circle cx="80" cy="127.5" r="12"/>
  <path d="M60.5 133H66M94 133H99.5" stroke-opacity=".65"/>
  <path d="M55 53V61M105 53V61" stroke-opacity=".5"/>`;

const wipers = `
  <path d="M21 44L123 18L126 26L24 52Z"/>
  <path d="M32 45L116 23M40 42L42 48M62 36L64 42M84 30L86 36M106 25L108 30" stroke-opacity=".6"/>
  <path d="M31 133L58 92L72 40L76 41L62 95L35 137Z"/>
  <circle cx="31" cy="137" r="5"/>
  <path d="M62 82L142 60L144 67L64 89Z"/>
  <path d="M72 82L135 65M79 78L81 84M101 72L103 78M123 66L125 72" stroke-opacity=".6"/>
  <path d="M78 138L92 113L99 77L103 78L96 116L82 141Z"/>
  <circle cx="78" cy="142" r="5"/>
  <path d="M44 128L49 121M87 133L91 126" stroke-opacity=".5"/>`;

const wheel = `
  <circle cx="80" cy="80" r="61"/>
  <circle cx="80" cy="80" r="55"/>
  <circle cx="80" cy="80" r="49"/>
  <circle cx="80" cy="80" r="17"/>
  <circle cx="80" cy="80" r="6"/>
  ${circularHoles(5, 11.5, 2, -Math.PI / 2)}
  ${Array.from({ length: 5 }, (_, i) => {
    const angle = -Math.PI / 2 + (i / 5) * Math.PI * 2;
    return `<path d="M${polar(18, angle - 0.18)}L${polar(32, angle - 0.13)}L${polar(48, angle - 0.3)}L${polar(48, angle - 0.14)}L${polar(35, angle + 0.015)}L${polar(48, angle + 0.25)}L${polar(48, angle + 0.4)}L${polar(30, angle + 0.15)}L${polar(18, angle + 0.18)}Z"/>`;
  }).join("")}
  <g stroke-opacity=".4">${Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    return `<path d="M${polar(57, angle)}L${polar(60, angle + 0.025)}"/>`;
  }).join("")}</g>`;

const spring = `
  <ellipse cx="80" cy="26" rx="29" ry="7"/>
  <path d="M51 26V33M109 26V33"/>
  <g stroke-opacity=".5">${Array.from({ length: 7 }, (_, i) => {
    const y = 39 + i * 13;
    return `<path d="M50 ${y}C50 ${y - 11} 110 ${y - 11} 110 ${y}"/>`;
  }).join("")}</g>
  ${Array.from({ length: 7 }, (_, i) => {
    const y = 39 + i * 13;
    return `<path d="M50 ${y}C50 ${y + 11} 110 ${y + 11} 110 ${y}"/>`;
  }).join("")}
  <path d="M50 39L51 26M110 117L109 134" stroke-opacity=".6"/>
  <ellipse cx="80" cy="134" rx="29" ry="7"/>
  <path d="M58 134C68 138 92 138 102 134" stroke-opacity=".45"/>`;

const drawings: Record<PartType, string> = {
  "brake-disc": brakeDisc,
  piston,
  wipers,
  wheel,
  spring,
};

const instances: PartType[] = [
  "brake-disc",
  "piston",
  "wipers",
  "wheel",
  "spring",
  "brake-disc",
  "piston",
  "wipers",
  "wheel",
  "spring",
  "brake-disc",
  "wheel",
];

export function createAutomotiveBackground(): HTMLDivElement {
  const background = document.createElement("div");
  background.className = "automotive-background";
  background.setAttribute("aria-hidden", "true");
  background.inert = true;
  for (const type of instances) {
    const part = document.createElement("span");
    part.className = "floating-part";
    part.dataset.part = type;
    part.innerHTML = `<svg class="part-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawings[type]}</svg>`;
    background.append(part);
  }
  return background;
}
