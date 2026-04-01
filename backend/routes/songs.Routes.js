import {
  addNewSong,
  getAllSongs,
  deleteSong,
  getSongsByAlbum,
  getTopSongs,
  getTrendingTeluguSongsTest
} from "../controllers/song.controller.js";
import { getExternalSongs, getTrendingTeluguSongs, getJioSaavnSongByUrl } from "../controllers/externalSongs.controller.js";
import { proxyAudio, validateAudioUrl } from "../controllers/audioProxy.controller.js";
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
router.route("/fetch-from-jiosaavvn-url").post(getJioSaavnSongByUrl);
router.route("/proxy-audio").get(proxyAudio);
router.route("/validate-audio-url").post(validateAudioUrl);
router.route("/test-route").get(getTrendingTeluguSongsTest);

// Local database songs routes
router.route("/addSong").post(upload.any(), addNewSong);
router.route("/getSongs").get(getAllSongs);
router.route("/getTopSongs").get(getTopSongs);
router.route("/deleteSong/:id").delete(deleteSong);
router.route("/getSongsByAlbum/:albumId").get(getSongsByAlbum);

export default router;
