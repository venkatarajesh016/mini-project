import React from "react";
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import axios from "axios";

export default function ListSongs() {
  const [songs, setSongs] = useState([]);
  const fetchSongs = async () => {
    try {
      const response = await fetch("http://localhost:3000/getSongs");
      const data = await response.json();
      console.log("Fetched songs:", data);
      setSongs(data);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/deleteSong/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log("Song deleted successfully");
        toast.success("Song deleted successfully!");
        fetchSongs();
      }
    } catch (error) {
      console.error("Error deleting song:", error);
      toast.error("Error deleting song.");
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);
  return (
    <div>
      <h1>List of Songs</h1>
      <div>
        <div className="table-header">
          <div>Name</div>
          <div>Image</div>
          <div>Album</div>
          <div>Artist</div>
          <div>Action</div>
        </div>
        {songs.map((song) => (
          <div key={song._id} className="table-row">
            <div>{song.title}</div>     
            <div>
                <img src={`http://localhost:3000/uploads/${song.ImageUrl}`} alt={song.title} width="50" />
            </div>
            <div>{song.album}</div>
            <div>{song.artist}</div>
            <div>
              <button onClick={() => handleDelete(song._id)}>Delete</button>
            </div>
          </div>
        ))}
    </div>
    </div>
  );
}
