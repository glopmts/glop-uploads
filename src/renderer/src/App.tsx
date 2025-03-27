import { Outlet } from "react-router-dom";
import "./app.scss";
import Sidebar from "./pages/home/sidebar/siderbar";

function App(): JSX.Element {
  return (
    <main>
      <Sidebar />
      <article className="container">
        <section className="container__content">
          <Outlet />
        </section>
      </article>
    </main>
  );
}

export default App;
