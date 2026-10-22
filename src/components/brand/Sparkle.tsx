/** Four-point sparkle glyph. Decorative: always hidden from assistive technology. */
export function Sparkle({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M12 0c.6 5.6 2.4 8.4 7.1 10.1L24 12l-4.9 1.9C14.4 15.6 12.6 18.4 12 24c-.6-5.6-2.4-8.4-7.1-10.1L0 12l4.9-1.9C9.6 8.4 11.4 5.6 12 0Z" />
    </svg>
  );
}
