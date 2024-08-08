const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const userJwt = require("../middlewares/userJwt");
// Define routes

router.post("/", userJwt ,orderController.createOrder);
router.get("/", userJwt ,orderController.getOrders);
router.delete("/:id", userJwt ,orderController.deleteOrder);
router.put("/:id", userJwt, orderController.updateOrder); 

module.exports = router;
