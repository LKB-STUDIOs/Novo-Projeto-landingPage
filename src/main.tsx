import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from "react-router";
import "./styles/global.css";

// cada página vira um arquivo separado: o visitante só baixa o que abre
const Home = lazy(() => import("./pages/Home"));
const Ferrus = lazy(() => import("./pages/ferrus/Ferrus"));
const Brisa = lazy(() => import("./pages/brisa/Brisa"));
const NaoEncontrada = lazy(() => import("./pages/NaoEncontrada"));
const CursosLayout = lazy(() => import("./pages/cursos/CursosLayout"));
const Catalogo = lazy(() => import("./pages/cursos/Catalogo"));
const Entrar = lazy(() => import("./pages/cursos/Entrar"));
const MinhaArea = lazy(() => import("./pages/cursos/MinhaArea"));
const Curso = lazy(() => import("./pages/cursos/Curso"));
const Aula = lazy(() => import("./pages/cursos/Aula"));

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
      children: [
        { index: true, element: <Home /> },
        { path: "projetos/ferrus", element: <Ferrus /> },
        { path: "projetos/brisa", element: <Brisa /> },
        {
          path: "cursos",
          element: <CursosLayout />,
          children: [
            { index: true, element: <Catalogo /> },
            { path: "entrar", element: <Entrar /> },
            { path: "minha-area", element: <MinhaArea /> },
            { path: ":slug", element: <Curso /> },
            { path: ":slug/aula/:aulaId", element: <Aula /> },
          ],
        },
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
