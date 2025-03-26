import React, { FC } from "react";
import "./card.scss";

interface CardProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const Card: FC<CardProps> = ({
  title,
  children,
  className = "",
  onClick,
  hoverEffect = true,
}) => {
  return (
    <div
      className={`card ${className} ${hoverEffect ? 'card--hover' : ''}`}
      onClick={onClick}
    >
      {title && <h3 className="card__title">{title}</h3>}
      <div className="card__content">
        {children}
      </div>
    </div>
  );
};

export default Card;