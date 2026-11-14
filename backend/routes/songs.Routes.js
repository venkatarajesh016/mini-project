import {
  addNewSong,
  getAllSongs,
  deleteSong,
  getSongsByAlbum,
  getTopSongs,
} from "../controllers/song.controller.js";
import { getExternalSongs, getTrendingTeluguSongs } from "../controllers/externalSongs.controller.js";
import { Router } from "express";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null,file.originalname);
    }
});
const upload = multer({ storage: storage });

// External API songs routes - defining BEFORE local routes
router.route("/trending-telugu-songs").get(getTrendingTeluguSongs);
router.route("/external-songs").get(getExternalSongs);

// Local database songs routes
router.route("/addSong").post(upload.any(), addNewSong);
router.route("/getSongs").get(getAllSongs);
router.route("/getTopSongs").get(getTopSongs);
router.route("/deleteSong/:id").delete(deleteSong);
router.route("/getSongsByAlbum/:albumId").get(getSongsByAlbum);

export default router;
