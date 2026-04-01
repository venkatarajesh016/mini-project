import { get } from "mongoose";
import Song from "../models/songs.model.js";

export const addNewSong = async (req, res) => {
  try {
    const { title, artist, album, genre, releaseDate, duration } = req.body;
    
    // Find image and audio files from req.files array
    const imageFile = req.files?.find(f => f.fieldname === 'image');
    const audioFile = req.files?.find(f => f.fieldname === 'audio');
    
    // Set ImageUrl - use filename for relative path construction on frontend
    const ImageUrl = imageFile?.filename || req.body.ImageUrl;
    // Set FileUrl - use relative path
    const FileUrl = audioFile?.filename || req.body.FileUrl;
    
    const newSong = new Song({
        title,
        artist,
        album,
        genre,
        releaseDate,
        ImageUrl,
        FileUrl,
    });
    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (error) {
    res.status(500).json({ message: "Error adding new song", error });
  }
};

export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching songs", error });
  }
};

export const getSongById = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }
        res.status(200).json(song);
    } catch (error) {
        res.status(500).json({ message: "Error fetching song", error });
    }
};

export const deleteSong = async (req, res) => { 
    try {
        const deletedSong = await Song.findByIdAndDelete(req.params.id);
        if (!deletedSong) {
            return res.status(404).json({ message: "Song not found" });
        }
        res.status(200).json({ message: "Song deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting song", error });
    }
};

export const getSongsByAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        console.log("Fetching songs for album:", albumId);
        
        if (!albumId) {
            return res.status(400).json({ message: "Album ID is required" });
        }
        
        const songs = await Song.find({ album: albumId });
        console.log("Found songs:", songs);
        res.status(200).json(songs);
    } catch (error) {
        console.error("Error in getSongsByAlbum:", error);
        res.status(500).json({ message: "Error fetching songs by album", error: error.message });
    }
};

export const getSongsByArtist = async (req, res) => {
    try {
        const songs = await Song.find({ artist: req.params.artistName });
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching songs by artist", error });
    }
};

export const getTopSongs = async (req, res) => {
    try {
        const limit = req.query.limit || 6;
        // Get the most recently added songs (top songs)
        const songs = await Song.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: songs.length,
            songs: songs,
            source: 'local'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching top songs", 
            error: error.message 
        });
    }
};

export const getTrendingTeluguSongsTest = async (req, res) => {
    res.status(200).json({
        test: 'This is a test endpoint',
        time: new Date().toISOString()
    });
};