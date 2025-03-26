import ImagesSavesEdits from "@renderer/components/newsProject/editeImage"
import type { FC } from "react"
import "./Home.scss"
import Sidebar from "./sidebar/siderbar"
import "./sidebar/siderbar.scss"

const Home: FC = () => (
  <section className="home__content">
    <Sidebar />
    <main className="home__main">
      <header className="home__header">
        <h1>Bem vindo(a)</h1>
      </header>
      <div className="home__body">
        <ImagesSavesEdits />
      </div>
    </main>
  </section>
)

export default Home

