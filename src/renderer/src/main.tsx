import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter, Route, Routes } from "react-router-dom"
import App from "./app"
import { AuthProvider } from "./context/AuthProvider"
import FolderId from "./pages/folder/[id]"
import Home from "./pages/home/home"

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route element={<App />}>
              <Route path="/" element={<Home />} />
              <Route path="/folder" element={<FolderId />} />
            </Route>
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)

