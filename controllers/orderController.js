const Order = require("../models/order");
const mongoose = require("mongoose");

const createOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      user: req.user.userId,
      ...req.body,
    });

    const createdOrder = await newOrder.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating Order" });
  }
};

const getOrders = async (req, res) => {
  try {
    const user = req.query.user;
    const targetUser = req.query.targetUser;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const baseUrl = process.env.BASE_URL;

    // Initial aggregation pipeline
    let pipeline = [
      {
        $lookup: {
          from: "products", // The collection name of Product
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "files", // The collection name of files
          localField: "product.image",
          foreignField: "_id",
          as: "product.image",
        },
      },
      { $unwind: "$product.image" },
    ];

    // Create an initial match stage
    let match = {};

    if (user) {
      match.user = new mongoose.Types.ObjectId(user);
    }

    // Add targetUser condition if provided
    if (targetUser) {
      pipeline.push({
        $match: {
          "product.user": new mongoose.Types.ObjectId(targetUser),
        },
      });
    }

    // Pagination stages
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    // Run the aggregation pipeline
    const orders = await Order.aggregate(pipeline);

    // Update the url field in product.image for each order
    const updatedOrders = orders.map(order => {
      if (order.product && order.product.image) {
        order.product.image.url = baseUrl + order.product.image.url;
      }
      return order;
    });

    // Get the total count of orders matching the query
    let countPipeline = [
      { $match: match },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $project: { "product.user": 1 } },
      {
        $match: targetUser
          ? { "product.user": new mongoose.Types.ObjectId(targetUser) }
          : {},
      },
      { $count: "totalCount" },
    ];

    const countResult = await Order.aggregate(countPipeline);
    const totalCount = countResult[0] ? countResult[0].totalCount : 0;

    res.status(200).json({
      orders: updatedOrders,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalOrders: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching Orders" });
  }
};


const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId; // Assuming you have the userId in req.user
    // Find the order to ensure it exists and was created by the requesting user
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found or you do not have permission to delete this order",
      });
    }

    // Delete the order
    await Order.deleteOne({ _id: orderId });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting Order" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found or you do not have permission to update this order",
      });
    }

    // Update the order with the new data
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { ...req.body },
      { new: true }
    );

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating Order" });
  }
};

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrders,
};
