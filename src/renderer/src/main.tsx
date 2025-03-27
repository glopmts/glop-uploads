import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter, Route, Routes } from "react-router-dom"
import App from "./app"
import Home from "./pages/home/home"
import FolderId from "./pages/items/[id]"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<FolderId />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)

