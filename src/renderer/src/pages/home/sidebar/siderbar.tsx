import { HomeIcon } from "@primer/octicons-react"
import AuthUser from "@renderer/components/user/user-auth"
import cn from "classnames"
import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "../../../hooks/useAuth"
import "./siderbar.scss"

const routes = [
  {
    path: "/",
    nameKey: "Home",
    render: () => <HomeIcon />,
  },
]

const Sidebar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout, isInitialized } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isProfile, setProfile] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const handleProfile = () => {
    setProfile(!isProfile)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setProfile(false);
      }
    };

    if (isProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfile]);

  if (!isInitialized) {
    return null;
  }


  return (
    <>
      <aside className="sidebar">
        <div className="sidebar__container">
          <ul className="sidebar__menu">
            {routes.map(({ nameKey, path, render }) => (
              <li
                key={nameKey}
                className={cn("sidebar__menu-item", {
                  "sidebar__menu-item--active": location.pathname === path,
                })}
                onClick={(e) => {
                  if (isProfile) {
                    const target = e.target as HTMLElement;
                    if (!modalRef.current?.contains(target)) {
                      setProfile(false);
                    }
                  }
                }}
              >
                <button
                  type="button"
                  className="sidebar__menu-item-button"
                >
                  <span className="sidebar__menu-item-icon">{render()}</span>
                  <span className="sidebar__menu-item-text">{nameKey}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <footer className="sidebar__footer">
          {isAuthenticated && user ? (
            <div className="sidebar__user-info">
              <div className="sidebar__user-info-user" onClick={handleProfile}>
                {user.image ? (
                  <img src={user.image} className="sidebar__user-image" />
                ) : (
                  <div className="sidebar__user-avatar">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="sidebar__user-details">
                  <p className="sidebar__user-name">
                    {(user?.name ?? "").length > 20 ? (user?.name ?? "").slice(0, 17) + "..." : user?.name}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              className="sidebar__auth-button"
              onClick={() => setAuthModalOpen(true)}
            >
              Login/Register
            </button>
          )}
        </footer>

        {/* Only render the auth modal when needed */}
        {authModalOpen && (
          <AuthUser
            isModal={authModalOpen}
            setClose={() => setAuthModalOpen(false)}
          />
        )}

      </aside>
      {isProfile && (
        <div className="sidebar__infor-use" ref={modalRef}>
          <div className="sidebar__user-info-user-modal">
            {user?.image ? (
              <img src={user.image} className="sidebar__user-image" />
            ) : (
              <div className="sidebar__user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="sidebar__user-details-modal">
              <p className="sidebar__user-name">
                {(user?.name ?? "").length > 20 ? (user?.name ?? "").slice(0, 17) + "..." : user?.name}
              </p>
              <p className="sidebar__user-email">{user?.email}</p>
            </div>
          </div>
          <div className="sidebar__logout">
            <button
              className="sidebar__logout-button"
              onClick={() => {
                logout();
                setProfile(false)
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
