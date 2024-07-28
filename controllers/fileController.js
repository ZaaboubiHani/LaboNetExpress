const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const fs = require("fs");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = "uploads/";
      fs.mkdir(uploadPath, { recursive: true }, (err) => {
        if (err) {
          return cb(err, null);
        }
        cb(null, uploadPath);
      });
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

const upload = multer({
  storage: storage,
}).single("file");

const uploadImage = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if a poster was uploaded
    if (!req.file) {
      return res.status(400).send({ message: "No file selected" });
    }
    const fileUrl = req.file.path.replace(/\\/g, "/");
    const newFile = new File({ url: fileUrl }); // Store the single poster URL in an array

    await newFile.save();

    res.send(newFile);
  } catch (err) {
    res.status(500).send({
      message: "Error occurred during upload or database operation",
      error: err,
    });
  }
};

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const deleteImage = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }
    const baseUrl = process.env.BASE_URL;
    // Construct the correct file system path
    const filePath = file.url.replace(baseUrl, "");

    await deleteFile(filePath);

    // Remove the poster entry from the database
    await File.findByIdAndDelete(fileId);

    res.send({ message: "Poster deleted successfully" });
  } catch (err) {
    res.status(500).send({
      message: "Error occurred during deletion",
      error: err,
    });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
