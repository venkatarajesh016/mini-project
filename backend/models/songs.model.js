import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: { 
    type: String,
    required: true,
  },
    album: {    
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
        required: true
  },
    genre: {
    type: String,
    required: true,
  },
    releaseDate: {
    type: String,
    required: true,
  },
  ImageUrl: {
    type: String,
    required: true,
  },
  FileUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
  },
});

const Song = mongoose.model("Song", songSchema);

export default Song;