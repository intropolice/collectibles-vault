
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = "<h1>root element not found</h1>";
} else {
  createRoot(rootElement).render(<App />);
}