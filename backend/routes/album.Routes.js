import {addNewAlbum,getAllAlbums,deleteAlbum,getAlbumById} from "../controllers/album.controller.js";
import { Router } from "express";
import multer from "multer";
const router=Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null,file.originalname);
    }
});
const upload = multer({ storage: storage });

router.route("/addNewAlbum").post(upload.any(),addNewAlbum);
router.route("/getAllAlbums").get(getAllAlbums);
router.route("/deleteAlbum/:id").delete(deleteAlbum);
router.route("/getAlbumById/:id").get(getAlbumById);

export default router;