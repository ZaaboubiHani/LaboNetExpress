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
            userId: req.user.userId,
            ...req.body,
        });

        const createdProduct = await newProduct.save();

        res.status(201).json(createdProduct);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error creating Product" });
    }
};

const getProducts = async (req, res) => {
    try {
        const name = req.query.name;
        const userId = req.user.userId; // Assuming you have the userId in req.user

        let products;
        if (name) {
            // Perform a case-insensitive search by name and exclude products created by the requesting user
            products = await Product.find({ 
                name: { $regex: new RegExp(name, "i") },
            });
        } else {
            // If no name is provided, return all products except those created by the requesting user
            products = await Product.find({});
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Error fetching Products" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.userId; // Assuming you have the userId in req.user

        // Find the product to ensure it exists and was created by the requesting user
        const product = await Product.findOne({ _id: productId, userId: userId });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or you do not have permission to delete this product",
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

module.exports = {
    createProduct,
    getProducts,
    deleteProduct,
};