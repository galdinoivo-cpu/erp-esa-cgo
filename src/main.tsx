import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CgoProvider } from "@/state/CgoContext";
import App from "@/App";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CgoProvider>
        <App />
      </CgoProvider>
    </BrowserRouter>
  </React.StrictMode>
);
