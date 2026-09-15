import "./Header.css";
import { NavLink } from "react-router-dom";

function Header() {
  return (
    <header className="header">

  <div className="header-left">
    <img src="/sovreign command system.jpg" alt="Logo" className="logo" />
  </div>

  <div className="headerWrapper">
    <NavLink to="/devices" className="nav-link">
          Devices
        </NavLink>
     <NavLink to="/liveview" className="nav-link">
          Live View
        </NavLink>
     <NavLink to="/dashboard" className="nav-link">
          Dashboard
        </NavLink>
   <NavLink to="/settings" className="nav-link">
          Settings
        </NavLink>
  </div>

  <div className="header-right">
    <span>12:45 PM</span>
    <span>👤 Admin</span>
  </div>

</header>
  );
}

export default Header;