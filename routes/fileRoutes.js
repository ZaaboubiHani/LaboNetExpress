const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

// Define routes

router.post("/", fileController.uploadImage);
router.delete("/:id", fileController.deleteImage);

module.exports = router;
