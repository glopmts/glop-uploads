import type { FC } from "react"
import UserFolders from "./folder/folders"
import NewsFolder from "./folder/news-folder"
import "./Home.scss"
import NewsUploadFiles from "./news-upload/news-upload"
import "./sidebar/siderbar.scss"
import CardsUpload from "./uploads-cards/cards-upload"

const Home: FC = () => (
  <section className="home__content">
    <main className="home__main">
      <header className="home__header">
        <h1>Bem vindo(a)</h1>
      </header>
      <div className="home__body">
        <div className="home__buttons">
          <NewsFolder />
          <div className="">
            <NewsUploadFiles />
          </div>
        </div>
        <div className="">
          <UserFolders />
        </div>
        <div className="">
          <CardsUpload />
        </div>
      </div>
    </main>
  </section>
)

export default Home

