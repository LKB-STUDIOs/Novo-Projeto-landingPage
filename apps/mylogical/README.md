# MyLogical App

Consulta e edição dos dados do **MyLogical** (banco Firebird) no PC e no celular, pela rede local.

```
 Celular (Wi-Fi da empresa) ─┐
                             ├──►  Este app no seu PC  ──►  Firebird do MyLogical (IP do servidor:3050)
 Navegador do PC ────────────┘     (porta 8080)
```

O app não faz uma cópia do banco. Ele lê e grava **direto no banco do MyLogical**, então está sempre sincronizado: o que muda no MyLogical aparece no app, e o que muda no app aparece no MyLogical.

O que ele faz:

- lista **todas** as tabelas e visões do banco, lidas automaticamente (sem configurar nada por tabela);
- busca por texto ou código, ordena por qualquer coluna, pagina de 50 em 50;
- abre um registro e navega para registros ligados (ex.: do pedido para o cliente);
- inclui, altera e exclui registros (só em tabelas com chave primária; visões são só consulta);
- exporta qualquer tabela para CSV (abre no Excel com acentos certos);
- guarda um histórico de tudo que foi alterado em `dados/alteracoes.log`, com o valor **antes** de cada mudança;
- pede um PIN para entrar, tanto no PC quanto no celular.

## 1. Instalar (uma vez)

1. Copie a pasta `apps/mylogical` para o PC, por exemplo em `C:\MyLogicalApp`.
2. Dê dois cliques em **`iniciar.cmd`**.
   - Se o Node.js não estiver instalado, ele instala sozinho (o Windows pode pedir permissão). Depois feche a janela e dê dois cliques de novo.
   - Na primeira vez, ele pergunta o **IP do servidor** (campo "IP / Porta" da tela do MyLogical), a **senha do Firebird** (Enter usa a padrão, `masterkey`) e um **PIN** seu para entrar no app. As respostas ficam salvas no arquivo `.env`.
3. A janela mostra os endereços e o navegador abre sozinho:

```
   Neste PC:      http://localhost:8080
   No celular:    http://192.168.0.15:8080
   Conexão:       OK (Firebird 3.0.x)
```

Para mudar alguma configuração depois, abra o `.env` no Bloco de Notas:

| Campo | O que é |
|---|---|
| `FB_HOST` | IP do servidor do banco |
| `FB_DATABASE` | `MyLogical`. Se der erro de banco não encontrado, use o caminho completo do arquivo `.FDB` **no servidor** (ex.: `C:\MyLogical\Dados\MYLOGICAL.FDB`) |
| `FB_USER` / `FB_PASSWORD` | usuário e senha do Firebird |
| `APP_PIN` | o PIN para entrar no app |
| `ALLOW_WRITE` | `nao` (só consulta). Mude para `sim` quando quiser gravar |

Abra o primeiro endereço no navegador do PC. **Deixe a janela preta aberta** enquanto usar o app.

> **A senha fica só no `.env` do seu PC.** Não mande ela por mensagem e não suba esse arquivo para o GitHub (o projeto já está configurado para ignorá-lo).

### Sobre "Autenticação do Windows"

A tela do MyLogical está marcada com "Autenticação do Windows: Sim". Este app entra com **usuário e senha** do Firebird. O Firebird aceita os dois modos ao mesmo tempo, na configuração padrão. Se aparecer "O Firebird recusou usuário/senha" mesmo com a senha certa, peça a quem cuida do servidor para conferir, no `firebird.conf` do servidor, se `AuthServer` inclui `Srp` (ou `Legacy_Auth`).

## 2. Antes de ligar a gravação

Alterar dados direto no banco pula as regras que o MyLogical aplica nas telas dele (cálculos, estoque, financeiro etc.). Então:

1. **Faça um backup do banco** (pelo MyLogical ou com `gbak`) antes de ligar `ALLOW_WRITE=sim`.
2. Use a edição para correções simples (cadastros, observações, campos de texto). Evite mexer em valores que o MyLogical calcula, como saldos e totais.
3. Se errar, o arquivo `dados/alteracoes.log` mostra o valor antigo de cada campo alterado ou excluído, para você corrigir.

O app já protege contra:
- alterar ou excluir mais de um registro por vez (ele confere que a chave aponta para exatamente 1 registro);
- gravar em visões e em tabelas sem chave primária;
- valores no formato errado (data, número, tamanho máximo do texto);
- duas pessoas editando o mesmo registro ao mesmo tempo (o segundo recebe um aviso).

Ao editar, só os campos que você mudou são enviados ao banco.

### Recomendado: um usuário próprio em vez do SYSDBA

O `SYSDBA` pode tudo no banco. É mais seguro criar um usuário só para o app. Rode isto no servidor do banco (pelo `isql` ou IBExpert, conectado como SYSDBA), trocando a senha:

```sql
CREATE USER APPMOBILE PASSWORD 'troque-esta-senha';
-- Para só consultar, repita para cada tabela que o app pode ver:
GRANT SELECT ON CLIENTES TO APPMOBILE;
-- Para permitir alterações numa tabela:
GRANT SELECT, INSERT, UPDATE, DELETE ON CLIENTES TO APPMOBILE;
```

Depois coloque `FB_USER=APPMOBILE` e a nova senha no `.env`.

## 3. Usar no celular

1. O celular precisa estar no **mesmo Wi-Fi** da empresa que o PC.
2. Abra no navegador do celular o endereço "No celular" que aparece na janela (ex.: `http://192.168.0.15:8080`) e entre com o PIN.
3. Para ter o ícone na tela inicial:
   - **Android (Chrome):** menu ⋮ → **Adicionar à tela inicial**.
   - **iPhone (Safari):** botão compartilhar → **Adicionar à Tela de Início**.

Se o celular não abrir o endereço, o Firewall do Windows está bloqueando. Na primeira vez que o app roda, o Windows pergunta se deve permitir o acesso: marque **Redes privadas** e clique em Permitir. Se a pergunta não apareceu, rode isto uma vez no **Prompt de Comando como administrador**:

```bat
netsh advfirewall firewall add rule name="MyLogical App" dir=in action=allow protocol=TCP localport=8080 profile=private,domain
```

### Instalar como app "de verdade" (opcional)

Pelo endereço `http://`, o Android cria um atalho que abre no navegador. Para instalar como app (tela cheia, sem barra do navegador), o Chrome exige `https://`. Duas formas:

**A) Mais simples, só no Android:** no Chrome do celular, abra `chrome://flags`, procure **Insecure origins treated as secure**, coloque o endereço do app (ex.: `http://192.168.0.15:8080`), ative e reinicie o Chrome. Aí o menu mostra **Instalar app**.

**B) Com certificado HTTPS (Android e iPhone):** use o [mkcert](https://github.com/FiloSottile/mkcert) no PC:

```bat
mkcert -install
mkcert -cert-file certs\cert.pem -key-file certs\key.pem 192.168.0.15 localhost
```

Troque `192.168.0.15` pelo IP do seu PC. Reinicie o app: ele passa a abrir também em `https://IP:8443`. No celular, instale o certificado raiz do mkcert (o arquivo `rootCA.pem` da pasta que `mkcert -CAROOT` mostra) e abra o endereço `https://`.

> Dica: para o IP do PC não mudar, peça para fixar o IP dele no roteador (reserva de DHCP).

## 4. Problemas comuns

| Mensagem | O que fazer |
|---|---|
| Não consegui conectar no servidor do banco | O PC está na rede da empresa? O IP e a porta do `.env` estão iguais aos da tela do MyLogical? |
| O Firebird recusou usuário/senha | Confira `FB_USER` e `FB_PASSWORD`. Veja "Sobre Autenticação do Windows" acima |
| Banco não encontrado | Troque `FB_DATABASE` pelo caminho completo do `.FDB` no servidor |
| Acentos errados ou "Problema de acentuação" | Mude `FB_CHARSET=WIN1252` no `.env` (se continuar, tente `NONE`) e reinicie |
| Gravação desligada | Mude `ALLOW_WRITE=sim` no `.env` e reinicie |
| Uma tabela nova do MyLogical não aparece | Botão **↻ Atualizar** na tela inicial |

## Para quem for mexer no código

```
server/config.js   lê e valida o .env
server/db.js       conexão Firebird, leitura da estrutura do banco, consultas e gravações
server/index.js    servidor HTTP: login por PIN, API /api/..., arquivos do app, HTTPS opcional
public/            app PWA (HTML/CSS/JS puro, sem build): app.js, style.css, sw.js, manifest
```

Só tem uma dependência: `node-firebird`, que fala com o Firebird direto pela rede (não precisa instalar o cliente do Firebird no PC). Para rodar sem o `iniciar.cmd`:

```bash
npm install --omit=dev
npm start
```

Segurança: todos os valores vão para o banco como parâmetros (nunca colados no SQL), e nomes de tabelas e colunas só são aceitos se existirem na estrutura lida do banco. O PIN tem bloqueio progressivo após 5 tentativas erradas. A sessão dura 30 dias por aparelho.
