export function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <span className="logo" aria-label="LBK Studio">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="3" className="logo-anel" />
        <circle cx="16" cy="16" r="3.2" fill="var(--accent)" />
      </svg>
      {!compacto && (
        <span className="logo-texto">
          LBK<em>studio</em>
        </span>
      )}
    </span>
  );
}
