import { NavLink } from "react-router-dom";

export function TabBar() {
  return (
    <nav className="tab-bar">
      <NavLink to="/" end className={({ isActive }) => (isActive ? "tab-bar__item active" : "tab-bar__item")}>
        Запись
      </NavLink>
      <NavLink to="/entries" className={({ isActive }) => (isActive ? "tab-bar__item active" : "tab-bar__item")}>
        Дневник
      </NavLink>
      <NavLink to="/insights" className={({ isActive }) => (isActive ? "tab-bar__item active" : "tab-bar__item")}>
        Итоги недели
      </NavLink>
    </nav>
  );
}
