import { createBrowserRouter, Navigate } from "react-router";

import { EditorRoute } from "@/features/workspace/routes/EditorRoute";
import { HomeRoute } from "@/features/workspace/routes/HomeRoute";
import { SingletonTabRoute } from "@/features/workspace/routes/SingletonTabRoute";
import { WorkspaceLayout } from "@/features/workspace/WorkspaceLayout";

import { RouteError } from "./RouteError";

/**
 * Cada aba tem um endereço. O layout desenha todas as abas; as rotas filhas só escolhem qual
 * está em foco.
 */
export const router = createBrowserRouter([
  {
    element: <WorkspaceLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: "editor/:tabId", element: <EditorRoute /> },
      { path: "ajuda", element: <SingletonTabRoute type="help" /> },
      { path: "novidades", element: <SingletonTabRoute type="changelog" /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
