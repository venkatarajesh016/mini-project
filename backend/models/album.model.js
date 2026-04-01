import mongoose from "mongoose";
import Song from "./songs.model.js";
export const albumSchema = new mongoose.Schema({
    title: {
        type: String,   
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    ImageUrl: { 
        type: String,
        required: true,
    },
});

const Album = mongoose.model("Album",albumSchema);
export default Album;