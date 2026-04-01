import Album from "../models/album.model.js";

export const addNewAlbum = async(req,res)=>{
    try{
        const {title,artist,genre} = req.body;
        const imageFile = req.files?.find(f => f.fieldname === 'image');
        const ImageUrl = imageFile?.filename || req.body.ImageUrl;
        const newAlbum = new Album({
            title,
            artist,
            genre,
            ImageUrl,
        });
        const savedAlbum = await newAlbum.save();
        res.status(201).json(savedAlbum);
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Error adding new album",error});   
    }
};

export const getAllAlbums = async(req,res)=>{
    try{
        const albums = await Album.find();
        res.status(200).json(albums);
    }
    catch(error){
        res.status(500).json({message:"Error fetching albums",error});
    }
};

export const deleteAlbum = async (req,res)=>{
    try{
        const album = await Album.findByIdAndDelete(req.params.id);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }
        res.status(200).json(album);
    }
    catch(error){
        res.status(500).json({message:"Error deleting album",error:error});
    }
}

export const getAlbumById = async(req,res)=>{
    try{
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }
        console.log(album);
        res.status(200).json(album);
    }
    catch(error){
        res.status(500).json({message:"Error fetching album",error:error});
    }   
}