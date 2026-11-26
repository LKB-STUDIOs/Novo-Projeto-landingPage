// Lê as configurações do arquivo .env (na pasta do app) e valida.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const envFile = path.join(ROOT, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const env = process.env;
const sim = (v) => /^(1|s|sim|y|yes|true)$/i.test(String(v ?? '').trim());

const CHARSETS = ['UTF8', 'WIN1252', 'ISO8859_1', 'NONE'];

export const config = {
  fb: {
    host: env.FB_HOST || '127.0.0.1',
    port: Number(env.FB_PORT) || 3050,
    database: env.FB_DATABASE || 'MyLogical',
    user: env.FB_USER || 'SYSDBA',
    password: env.FB_PASSWORD || '',
    role: env.FB_ROLE || undefined,
    encoding: CHARSETS.includes(String(env.FB_CHARSET).toUpperCase())
      ? String(env.FB_CHARSET).toUpperCase()
      : 'UTF8',
  },
  port: Number(env.PORT) || 8080,
  httpsPort: Number(env.HTTPS_PORT) || 8443,
  pin: String(env.APP_PIN ?? '').trim(),
  allowWrite: sim(env.ALLOW_WRITE),
  dataDir: path.join(ROOT, 'dados'),
  certDir: path.join(ROOT, 'certs'),
  publicDir: path.join(ROOT, 'public'),
};

export function validarConfig() {
  const erros = [];
  if (!existsSync(envFile)) erros.push('Arquivo .env não encontrado. Copie .env.example para .env e preencha.');
  if (!env.FB_HOST) erros.push('FB_HOST está vazio (IP do servidor do banco, o mesmo da tela do MyLogical).');
  if (config.pin.length < 4) erros.push('APP_PIN precisa ter pelo menos 4 caracteres (é a senha para entrar no app).');
  if (!config.fb.password) erros.push('FB_PASSWORD está vazio (senha do usuário do Firebird).');
  return erros;
}
