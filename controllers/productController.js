const Product = require("../models/product");
const mongoose = require("mongoose");

const createProduct = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer le nom de votre produit",
      });
    }
    if (!req.body.price) {
      return res.status(400).json({
        success: false,
        message: "Veuillez entrer le prix de votre produit",
      });
    }

    const newProduct = new Product({
      user: req.user.userId,
      ...req.body,
    });

    const createdProduct = await newProduct.save();

    // Find the product again and populate the 'image' field
    const populatedProduct = await Product.findById(
      createdProduct._id
    ).populate("image");

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating Product" });
  }
};

const getProducts = async (req, res) => {
  try {
    const name = req.query.name;
    const user = req.query.user;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 products per page

    // Initialize an empty query object
    let query = {};

    // Add name condition if provided
    if (name) {
      query.name = { $regex: new RegExp(name, "i") };
    }

    // Add user condition if provided
    if (user) {
      query.user = user;
    }

    // Find products based on the query and paginate the results
    const products = await Product.find(query)
      .populate("image")
      .skip((page - 1) * limit)
      .limit(limit);

    // Get the total count of products matching the query
    const totalCount = await Product.countDocuments(query);

    res.status(200).json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalProducts: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching Products" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.userId; // Assuming you have the userId in req.user
    // Find the product to ensure it exists and was created by the requesting user
    const product = await Product.findOne({ _id: productId, user: userId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found or you do not have permission to delete this product",
      });
    }

    // Delete the product
    await Product.deleteOne({ _id: productId });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting Product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found or you do not have permission to update this product",
      });
    }

    // Update the product with the new data
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { ...req.body },
      { new: true }
    ).populate("image");

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating Product" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
};