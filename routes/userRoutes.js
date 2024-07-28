const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userJwt = require("../middlewares/userJwt");
// Define routes

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.put("/:id",userJwt, userController.updateUser);
router.get("/me", userJwt, userController.getMe);
router.post('/validate', userController.validateUser);
router.post('/code', userController.sendCode);
module.exports = router;
