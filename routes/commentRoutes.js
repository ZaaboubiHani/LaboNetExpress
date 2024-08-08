const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const userJwt = require("../middlewares/userJwt");
// Define routes

router.post("/", userJwt ,commentController.createComment);
router.get("/", userJwt ,commentController.getComments);
router.delete("/:id", userJwt ,commentController.deleteComment);
router.put("/:id", userJwt, commentController.updateComment); 

module.exports = router;
