/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Endereço do projeto no Supabase (https://xxxx.supabase.co). Vazio = modo demonstração. */
  readonly VITE_SUPABASE_URL?: string;
  /** Chave pública ("anon") do Supabase. Pode ficar no código do site: quem protege os dados são as regras do banco. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
