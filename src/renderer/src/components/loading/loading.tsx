import { FC } from "react";
import "./loading.scss";

const Laoding: FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Carregando arquivos...</p>
    </div>
  );
}

export default Laoding;