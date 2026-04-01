import React from "react";
import { Link } from "react-router-dom";
import "./sideBar.css"
export default function Sidebar() {
  return (
    <div className="sidebar">
        <div className="d-flex">
            <i class="fa-brands fa-spotify" style={{fontSize:"30px"}}></i>
            <h3>Spotify</h3>
        </div>
    <div className="list">

        <div className="sidebar-links">
            <i class="fa-solid fa-music"></i>
            <Link to="/add-song">Add Song</Link>
        </div>
        <div className="sidebar-links">
            <i class="fa-brands fa-deezer"></i>
            <Link to="/songs">List Song</Link>
        </div>
        <div className="sidebar-links">
            <i class="fa-regular fa-folder-open"></i>
            <Link to="/add-album">Add Album</Link>
        </div>
        <div className="sidebar-links">
            <i class="fa-solid fa-box-archive"></i>
            <Link to="/albums">List Album</Link>
        </div>
    </div>
    </div>
  );
}
