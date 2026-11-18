import { describe, expect, it } from "vitest";
import { montarCsp, origemDoSupabase } from "../../vite.csp";

describe("política de segurança (CSP)", () => {
  it("sem Supabase, só o próprio site e o player do YouTube", () => {
    const csp = montarCsp(null);
    expect(csp).toContain("connect-src 'self';");
    expect(csp).toContain("frame-src https://www.youtube-nocookie.com;");
    expect(csp).toContain("script-src 'self';");
    expect(csp).not.toContain("unsafe");
  });
  it("com Supabase, libera só aquele endereço", () => {
    const csp = montarCsp(origemDoSupabase("https://abcdxyz.supabase.co/qualquer/coisa"));
    expect(csp).toContain("connect-src 'self' https://abcdxyz.supabase.co;");
  });
  it("recusa endereço que não seja https simples (evita injetar regras na política)", () => {
    for (const mau of ["http://abc.supabase.co", "https://a.com; script-src *", "javascript:alert(1)", "https://a.com'\" ", "lixo", ""])
      expect(origemDoSupabase(mau), mau).toBeNull();
  });
});
