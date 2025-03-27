import { FC } from "react";

type VideoProps = {
  video?: string;
}

const VideosPlay: FC<VideoProps> = ({
  video
}) => {
  return (
    <div className="">
      <video src={video} />
    </div>
  );
}

export default VideosPlay;