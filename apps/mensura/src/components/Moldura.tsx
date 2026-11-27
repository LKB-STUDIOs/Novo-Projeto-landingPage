import type { ReactNode } from "react";
import { MARCA, WHATSAPP } from "../config";
import { CURSOS } from "../cursos";
import { useAluno } from "../lib/aluno";
import { href } from "../lib/rota";
import { linkWhatsApp } from "../lib/whatsapp";
import { IconeWhats, Usuario } from "./Icones";

export function Logo() {
  return (
    <a href={href.inicio()} className="logo" aria-label={`${MARCA.nome}, página inicial`}>
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <rect width="32" height="32" rx="7" className="logo-fundo" />
        <path d="M7 22h18M9 22v-6M13 22v-4M17 22v-8M21 22v-4M25 22v-6" className="logo-tracos" />
        <circle cx="17" cy="10" r="2.2" className="logo-ponto" />
      </svg>
      <span>
        {MARCA.nome}
        <small>{MARCA.descricao}</small>
      </span>
    </a>
  );
}

function Nav() {
  const aluno = useAluno();
  return (
    <header className="nav">
      <div className="nav-dentro">
        <Logo />
        <nav aria-label="Principal" className="nav-links">
          <a href={href.inicio("cursos")}>Cursos</a>
          <a href={href.inicio("como-funciona")}>Como funciona</a>
          <a href={href.inicio("duvidas")}>Dúvidas</a>
        </nav>
        <a href={href.aluno()} className="btn btn-escuro btn-pequeno">
          <Usuario size={16} />
          <span>{aluno.nome ? `Olá, ${aluno.nome.split(" ")[0]}` : "Área do aluno"}</span>
        </a>
      </div>
    </header>
  );
}

function Rodape() {
  return (
    <footer className="rodape">
      <div className="conteudo rodape-grade">
        <div>
          <Logo />
          <p className="rodape-texto">Cursos em vídeo de metrologia para quem mede no chão de fábrica, no laboratório e na sala de aula.</p>
        </div>
        <div>
          <h3>Cursos</h3>
          <ul>
            {CURSOS.map((c) => (
              <li key={c.slug}><a href={href.curso(c.slug)}>{c.titulo}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Contato</h3>
          <ul>
            <li>
              <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">WhatsApp {WHATSAPP.exibicao}</a>
            </li>
            <li><a href={href.aluno()}>Área do aluno</a></li>
          </ul>
        </div>
      </div>
      <div className="conteudo rodape-fim">
        <span>© {new Date().getFullYear()} {MARCA.nome}. Todos os direitos reservados.</span>
        <span className="mono">±0,05 mm de cuidado em cada aula</span>
      </div>
    </footer>
  );
}

function WhatsFlutuante() {
  return (
    <a className="whats" href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
      <IconeWhats size={30} />
      <span className="whats-rotulo">Fale com a gente</span>
    </a>
  );
}

export function Moldura({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="pular" onClick={(e) => { e.preventDefault(); document.getElementById("conteudo")?.focus(); }}>
        Pular para o conteúdo
      </a>
      <Nav />
      <main id="conteudo" tabIndex={-1}>{children}</main>
      <Rodape />
      <WhatsFlutuante />
    </>
  );
}
