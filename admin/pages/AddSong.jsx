import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
export default function AddSong() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [isSongUploaded, setIsSongUploaded] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [songFile, setSongFile] = useState(null);
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [genre, setGenre] = useState("");
  const [album, setAlbum] = useState("");
  const [allAlbums, setAllAlbums] = useState([]);
  const getAlbums = async () => {
    try {
      const albums = await axios.get("http://localhost:3000/getAllAlbums");
      setAllAlbums(albums.data);
      console.log("Albums:", albums.data);
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };
  useEffect(() => {
    getAlbums();
  }, []);

  const handleChange1 = (event) => {
    setIsUploaded(true);
    setImageFile(event.target.files[0]);
  };
  const handleChange2 = (event) => {
    setIsSongUploaded(true);
    setSongFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("audio", songFile);
      formData.append("title", songName);
      formData.append("artist", artistName);
      formData.append("album", album);
      formData.append("genre", genre);
      formData.append("releaseDate", releaseDate);

      const response = await axios.post("http://localhost:3000/addSong", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response:", response);
      console.log(response.status);
      if (response.status === 201) {
        toast.success("Song added successfully!");
        event.target.reset();
        setIsUploaded(false);
        setIsSongUploaded(false);
        setImageFile(null);
        setSongFile(null);
        setSongName("");
        setArtistName("");
        setReleaseDate("");
        setGenre("");
        setAlbum("");
      } else {
        toast.error("Failed to add song.");
      }
    } catch (error) {
      console.error("Error uploading song:", error);
      toast.error("Error uploading song.");
    }
  };
  return (
    <div className="container">
      <h1>Add New Song</h1>
      <div className="row">
        <div className="col-6">
          <form action="" onSubmit={handleSubmit}>
            <div className="box">
              <div className="left">
                <label htmlFor="imageUrl" className="pic">
                  {" "}
                  {isUploaded ? (
                    <i class="fa-solid fa-check"></i>
                  ) : (
                    <i class="fa-regular fa-image"></i>
                  )}
                </label>
                <br />
                <input
                  id="imageUrl"
                  type="file"
                  placeholder="Image URL"
                  hidden
                  onChange={handleChange1}
                />
                <br />
              </div>
              <div className="right">
                <label htmlFor="songUrl" className="pic">
                  {" "}
                  {isSongUploaded ? (
                    <i class="fa-solid fa-check"></i>
                  ) : (
                    <i class="fa-solid fa-upload"></i>
                  )}
                </label>
                <br />
                <input
                  id="songUrl"
                  type="file"
                  placeholder="song URL"
                  hidden
                  onChange={handleChange2}
                />
                <br />
              </div>
            </div>
            <label htmlFor="songName">Song Name:</label>
            <br />
            <input
              id="songName"
              type="text"
              placeholder="Song Name"
              onChange={(e) => setSongName(e.target.value)}
              value={songName}
            />
            <br />
            <label htmlFor="artistName">Artist Name:</label>
            <br />
            <input
              id="artistName"
              type="text"
              placeholder="Artist Name"
              onChange={(e) => setArtistName(e.target.value)}
              value={artistName}
            />
            <br />
            <label htmlFor="releaseDate">Release Date:</label>
            <br />
            <input
              id="releaseDate"
              type="date"
              placeholder="Release Date"
              onChange={(e) => setReleaseDate(e.target.value)}
                value={releaseDate}
            />
            <br />
            <label htmlFor="genre">Genre:</label>
            <br />
            <input
              id="genre"
              type="text"
              placeholder="Genre"
              onChange={(e) => setGenre(e.target.value)}
                value={genre}
            />
            <br />
            <select
              name="Album"
              id="AlbumSelect"
              onChange={(e) => setAlbum(e.target.value)}
                value={album}
            >
              <option value="">Select Album</option>
              {allAlbums.map((album) => (
                <option key={album._id} value={album._id}>
                  {album.title}
                </option>
              ))}
            </select>
            <br />
            <button type="submit">Add Song</button>
          </form>
        </div>
        <div className="col-6"></div>
      </div>
    </div>
  );
}

//         title,
//         artist,
//         album,
//         genre,
//         releaseDate,
//         ImageUrl,
//         FileUrl,
//         duration,
