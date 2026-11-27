import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, isRouteErrorResponse, Outlet, RouterProvider, ScrollRestoration, useRouteError } from "react-router";
import "./styles/global.css";

/*
 * Depois de uma atualização do site, quem estava com a página aberta pode pedir um arquivo
 * que mudou de nome. Nesse caso recarregamos uma vez (nunca em loop) para pegar a versão nova.
 */
const CHAVE_RECARGA = "lbk-recarregou";
window.addEventListener("vite:preloadError", (e) => {
  let ja = false;
  try { ja = sessionStorage.getItem(CHAVE_RECARGA) === "1"; sessionStorage.setItem(CHAVE_RECARGA, "1"); } catch { /* sem storage */ }
  if (!ja) {
    e.preventDefault();
    window.location.reload();
  }
});
window.addEventListener("load", () => {
  setTimeout(() => { try { sessionStorage.removeItem(CHAVE_RECARGA); } catch { /* ok */ } }, 10000);
});

function Erro() {
  const erro = useRouteError();
  const pagina = isRouteErrorResponse(erro) && erro.status === 404;
  return (
    <main className="erro-app">
      <p className="erro-marca">LBK<span>studio</span></p>
      <h1>{pagina ? "Página não encontrada." : "Algo não carregou direito."}</h1>
      <p>{pagina ? "Confira o endereço ou volte ao início." : "Pode ter sido a conexão. Tente recarregar a página."}</p>
      <div className="erro-acoes">
        {!pagina && <button onClick={() => window.location.reload()}>Recarregar</button>}
        <a href={import.meta.env.BASE_URL}>Voltar ao início</a>
      </div>
    </main>
  );
}

// cada página vira um arquivo separado: o visitante só baixa o que abre
const Home = lazy(() => import("./pages/Home"));
const Ferrus = lazy(() => import("./pages/ferrus/Ferrus"));
const Brisa = lazy(() => import("./pages/brisa/Brisa"));
const Vertice = lazy(() => import("./pages/vertice/Vertice"));
const NaoEncontrada = lazy(() => import("./pages/NaoEncontrada"));

function Layout() {
  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<div className="carregando-rota">Carregando…</div>}>
        <Outlet />
      </Suspense>
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <Erro />,
      children: [
        { index: true, element: <Home /> },
        { path: "projetos/ferrus/:modulo?/:aba?", element: <Ferrus /> },
        { path: "projetos/brisa", element: <Brisa /> },
        { path: "projetos/vertice", element: <Vertice /> },
        { path: "*", element: <NaoEncontrada /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
