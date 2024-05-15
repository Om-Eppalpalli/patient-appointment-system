import React, { useState } from "react";
import "./Navbar.css";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaSignOutAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Navbar = ({handleLogout}) => {
  const [showMediaIcons, setShowMediaIcons] = useState(false);
  return (
    <>
      <nav className="main-nav">
        {/* 1st logo part  */}
        {/* <div className="logo">
          <h2>
            <span>T</span>hapa
            <span>T</span>echnical
          </h2>
        </div> */}

        {/* 2nd menu part  */}
        <div
          className={
            showMediaIcons ? "menu-link mobile-menu-link" : "menu-link"
          }>
          <ul>
            <li>
              <NavLink to="/patients">Patients List</NavLink>
            </li>
            <li>
              <NavLink to="/appointments">Appointments List</NavLink>
            </li>
            <li>
              <NavLink to="/doctors">Doctors List</NavLink>
            </li>
            <li>
              <NavLink to="/users">Users List</NavLink>
            </li>
          </ul>
        </div>
        <div className="logout-icon">
          <FaSignOutAlt size={24} style={{float: 'right', marginTop: '7%', cursor: "pointer" }} onClick={handleLogout}/>
        </div>
      </nav>

      {/* hero section  */}
      {/* {<section className="hero-section">
        <h1>Appointment Booking Module</h1>
      </section>} */}
    </>
  );
};

export default Navbar;