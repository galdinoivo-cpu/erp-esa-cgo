import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/state/AuthContext";
import App from "@/App";
import "@/index.css";

/** Em produção (GitHub Pages) o Vite define BASE_URL com o subcaminho do repo. */
const baseUrl = import.meta.env.BASE_URL ?? "/";
const routerBasename =
  baseUrl === "/" ? undefined : (baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={routerBasename}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
