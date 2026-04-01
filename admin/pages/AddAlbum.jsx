import React from "react";
import "../public/albums.css";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
export default function AddAlbum() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [albumName, setAlbumName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const handleSubmit = async (event) => {
    try {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", albumName);
    formData.append("artist", artistName);
    formData.append("genre", genre);
    const response = await axios
      .post("http://localhost:3000/addNewAlbum", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
        console.log("Response:", response);
        console.log(response.status);
        if (response.status === 201) {
          toast.success("Album added successfully!");
          event.target.reset();
          setIsUploaded(false);
          setImageFile(null);
          setAlbumName("");
          setArtistName("");
          setGenre("");
        } else {
          toast.error("Failed to add album.");
        }
      }
      catch(error){ 
        console.error("Error uploading album:", error);
        toast.error("Error uploading album.");
      }
  };
  const handleChange = (event) => {
    setIsUploaded(true);
    setImageFile(event.target.files[0]);
  };
  return (
    <div className="container">
      <h1>Add New Album</h1>
      <div className="row">
        <div className="col-6">
          <form onSubmit={handleSubmit}>
            <div className="left">
              <label htmlFor="image" className="pic">
                {" "}
                {isUploaded ? (
                  <i class="fa-solid fa-check"></i>
                ) : (
                  <i class="fa-regular fa-image"></i>
                )}
              </label>
              <br />
              <input
                id="image"
                type="file"
                placeholder="Image URL"
                hidden
                onChange={handleChange}
              />
              <br />
            </div>
            <label htmlFor="albumName">Album Name:</label>
            <br />
            <input
              id="albumName"
              type="text"
              placeholder="Album Name"
              onChange={(e) => setAlbumName(e.target.value)}
            />
            <br />
            <label htmlFor="artistName">Artist Name:</label>
            <br />
            <input
              id="artistName"
              type="text"
              placeholder="Artist Name"
              onChange={(e) => setArtistName(e.target.value)}
            />
            <br />
            <label htmlFor="genre">Genre:</label>
            <br />
            <input
              id="genre"
              type="text"
              placeholder="Genre"
              onChange={(e) => setGenre(e.target.value)}
            />
            <br />
            <button type="submit">Add Album</button>
          </form>
        </div>
        <div className="col-6"></div>
      </div>
    </div>
  );
}
