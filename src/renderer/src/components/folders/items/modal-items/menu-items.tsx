import { useEffect, useRef } from "react";
import "./menu-items.scss";

type MenuOption = {
  label: string;
  icon?: string;
  onClick: () => void;
  divider?: boolean;
  danger?: boolean;
};

type MenuFolderProps = {
  onClose: () => void;
  position: { x: number; y: number } | null;
  folderId?: string;
  folderTitle?: string;
  options?: MenuOption[];
  handleDelete: (id: string) => void;
};

const MenuItems = ({ onClose, position, folderId, folderTitle, options, handleDelete }: MenuFolderProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const defaultOptions: MenuOption[] = [
    {
      divider: true,
      label: "",
      onClick: () => { },
    },
    {
      label: "Copy",
      icon: "copy",
      onClick: () => console.log(`Copying folder: ${folderTitle || folderId}`),
    },
    {
      label: "Cut",
      icon: "scissors",
      onClick: () => console.log(`Cutting folder: ${folderTitle || folderId}`),
    },
    {
      divider: true,
      label: "",
      onClick: () => { },
    },
    {
      label: "Delete",
      icon: "trash",
      onClick: () => handleDelete(folderId!),
      danger: true,
    },
    {
      label: "Properties",
      icon: "info",
      onClick: () => console.log(`Properties for folder: ${folderTitle || folderId}`),
    },
  ];

  const menuOptions = options || defaultOptions;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!position) return null;

  return (
    <div
      className="menu-folders__container"
      ref={menuRef}
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="menu-folders__content">
        {menuOptions.map((option, index) => (
          option.divider ? (
            <div key={`divider-${index}`} className="menu-folders__divider" />
          ) : (
            <button
              key={`option-${index}`}
              className={`menu-folders__item ${option.danger ? 'menu-folders__item--danger' : ''}`}
              onClick={() => {
                option.onClick();
                onClose();
              }}
            >
              {option.icon && (
                <span className={`menu-folders__icon menu-folders__icon--${option.icon}`} />
              )}
              <span className="menu-folders__label">{option.label}</span>
            </button>
          )
        ))}
      </div>
    </div>
  );
};

export default MenuItems;
