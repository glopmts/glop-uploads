import { HomeIcon } from "@primer/octicons-react"
import cn from "classnames"
import { useLocation, useNavigate } from "react-router-dom"

const routes = [
  {
    path: "/",
    nameKey: "Home",
    render: () => <HomeIcon />,
  },
  // Add more routes as needed
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleSidebarItemClick = (path: string) => {
    if (path !== location.pathname) {
      navigate(path)
    }
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
              <button type="button" className="sidebar__menu-item-button" onClick={() => handleSidebarItemClick(path)}>
                <span className="sidebar__menu-item-icon">{render()}</span>
                <span className="sidebar__menu-item-text">{nameKey}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar