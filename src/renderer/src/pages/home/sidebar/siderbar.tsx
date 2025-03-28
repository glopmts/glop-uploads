import { HomeIcon } from "@primer/octicons-react"
import AuthUser from "@renderer/components/user/user-auth"
import cn from "classnames"
import { useState } from "react"
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

  if (!isInitialized) {
    return null;
  }


  return (
    <aside className="sidebar">
      <div className="sidebar__container">
        <ul className="sidebar__menu">
          {routes.map(({ nameKey, path, render }) => (
            <li
              key={nameKey}
              className={cn("sidebar__menu-item", {
                "sidebar__menu-item--active": location.pathname === path,
              })}
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
            <div className="sidebar__user-info-user">
              {user.image ? (
                <img src={user.image} className="sidebar__user-image" />
              ) : (
                <div className="sidebar__user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="sidebar__user-details">
                <p className="sidebar__user-name">{user.name}</p>
              </div>
            </div>
            <button
              className="sidebar__logout-button"
              onClick={() => {
                logout();
              }}
            >
              Logout
            </button>
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
  );
};

export default Sidebar;
