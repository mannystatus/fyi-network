// Recreated natively from the fyiCams brand kit's icon-only mark (outlined
// camera body + lens ring + viewfinder hump) per the kit's own instruction
// to recreate the SVG rather than embed the PNG at small sizes. Uses
// currentColor so it can be recolored per-context (teal masthead, cream
// footer-on-dark, etc.) the same way ShareButtons' icons do.
export default function CamsLogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="7.5" y="4.5" width="4" height="2" fill="currentColor" stroke="none" />
      <rect x="3" y="6.5" width="18" height="13" rx="1" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
