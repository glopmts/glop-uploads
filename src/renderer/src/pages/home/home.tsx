import type { FC } from "react"
import "./Home.scss"
import Sidebar from "./sidebar/siderbar"
import "./sidebar/siderbar.scss"
import CardsUpload from "./uploads-cards/cards-upload"

const Home: FC = () => (
  <section className="home__content">
    <Sidebar />
    <main className="home__main">
      <header className="home__header">
        <h1>Bem vindo(a)</h1>
      </header>
      <div className="home__body">
        <CardsUpload />
      </div>
    </main>
  </section>
)

export default Home

