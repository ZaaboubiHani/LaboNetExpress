const Comment = require("../models/comment");
const mongoose = require("mongoose");

const createComment = async (req, res) => {
    try {
      // Create and save the new comment
      const newComment = new Comment({
        user: req.user.userId,
        ...req.body,
      });
      await newComment.save();
  
      // Populate the user field
      const populatedComment = await Comment.findById(newComment._id).populate({
        path: "user",
        select:
          "-passwordHash -wilaya -commune -email -phoneNumber1 -phoneNumber2 -isValidated -isAdmin -deviceToken -coordinates -type", // Exclude passwordHash field in user population
      });
  
      // Return the populated comment
      res.status(201).json(populatedComment);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating Comment" });
    }
  };
  

const getComments = async (req, res) => {
  try {
    const product = req.query.product;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 comments per page

    // Initialize an empty query object
    let query = {};

    if (product) {
      query.product = product;
    }

    // Find comments based on the query and paginate the results
    const comments = await Comment.find(query)
      .populate({
        path: "user",
        select:
          "-passwordHash -wilaya -commune -email -phoneNumber1 -phoneNumber2 -isValidated -isAdmin -deviceToken -coordinates -type", // Exclude passwordHash field in user population
      })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get the total count of comments matching the query
    const totalCount = await Comment.countDocuments(query);

    res.status(200).json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalComments: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching Comments" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.userId; // Assuming you have the userId in req.user
    // Find the comment to ensure it exists and was created by the requesting user
    const comment = await Comment.findOne({ _id: commentId, user: userId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message:
          "Comment not found or you do not have permission to delete this comment",
      });
    }

    // Delete the comment
    await Comment.deleteOne({ _id: commentId });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error deleting Comment" });
  }
};

const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findOne({ _id: commentId });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message:
          "Comment not found or you do not have permission to update this comment",
      });
    }

    // Update the comment with the new data
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { ...req.body },
      { new: true }
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating Comment" });
  }
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getComments,
};
