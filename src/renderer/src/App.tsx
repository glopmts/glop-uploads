import { Outlet } from "react-router-dom";
import "./app.scss";
import { ToastProvider } from "./context/toast-context";
import Sidebar from "./pages/home/sidebar/siderbar";

function App(): JSX.Element {

  return (
    <ToastProvider>
      <main>
        <Sidebar />
        <article className="container">
          <section className="container__content">
            <Outlet />
          </section>
        </article>
      </main>
    </ToastProvider>
  );
}

export default App;
