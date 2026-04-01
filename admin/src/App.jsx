import React from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import { Routes, Route } from "react-router-dom";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import ListSongs from "../pages/ListSong";
import ListAlbums from "../pages/ListAlbum";
import AddSong from "../pages/AddSong";
import AddAlbum from "../pages/AddAlbum";
function App() {
  return (
    <>
      <ToastContainer />
      <div>
        <div className="row">
          <div className="col-2">
            <SideBar />
          </div>
          <div className="col-8">
          <Routes>
            <Route path="/songs" element={<ListSongs />} />
            <Route path="/albums" element={<ListAlbums />} />
            <Route path="/add-song" element={<AddSong />} />
            <Route path="/add-album" element={<AddAlbum />} />
          </Routes>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
