type P = { size?: number };
const linha = (size: number, d: string) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const IconeWhats = ({ size = 20 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
  </svg>
);
export const Play = ({ size = 22 }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
  </svg>
);
export const Cadeado = ({ size = 18 }: P) => linha(size, "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3");
export const Check = ({ size = 18 }: P) => linha(size, "M5 12.5 10 17 19 7");
export const Seta = ({ size = 18 }: P) => linha(size, "M5 12h14M13 6l6 6-6 6");
export const Voltar = ({ size = 18 }: P) => linha(size, "M19 12H5M11 6l-6 6 6 6");
export const Relogio = ({ size = 16 }: P) => linha(size, "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z");
export const Camadas = ({ size = 16 }: P) => linha(size, "m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5");
export const Usuario = ({ size = 18 }: P) => linha(size, "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0");
export const Mais = ({ size = 18 }: P) => linha(size, "M12 5v14M5 12h14");
