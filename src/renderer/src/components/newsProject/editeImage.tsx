import { DiffAddedIcon } from "@primer/octicons-react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../cards/card";
import "./editeIameg.scss";

const ImagesSavesEdits: FC = () => {
  const navigate = useNavigate()

  const handleNaviget: () => void = () => {
    navigate("/edite-image")
  }


  return (
    <section className="imagesSaves">
      <h4>News edite Image</h4>
      <Card onClick={handleNaviget} className="imagesSaves__card" hoverEffect>
        <DiffAddedIcon size={20} />
      </Card>
      <div >

      </div>
    </section>
  );
}

export default ImagesSavesEdits;