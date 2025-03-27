import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter, Route, Routes } from "react-router-dom"
import App from "./app"
import Home from "./pages/home/home"
import FolderId from "./pages/items/[id]"

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<Home />} />
            <Route path="/items" element={<FolderId />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </HashRouter>
  </React.StrictMode>,
)

