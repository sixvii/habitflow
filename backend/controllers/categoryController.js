const Category = require('../models/Category');
const Task = require('../models/Task');

// @desc    Get all categories for a user
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.userId }).sort({ name: 1 });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: { message: 'Error fetching categories' } });
  }
};

// @desc    Get a single category
// @route   GET /api/categories/:id
// @access  Private
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }

    // Get task count for this category
    const taskCount = await Task.countDocuments({
      category: category._id,
      user: req.userId
    });

    res.json({
      success: true,
      data: {
        category: {
          ...category.toObject(),
          taskCount
        }
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: { message: 'Error fetching category' } });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: { message: 'Please provide a category name' } });
    }

    const category = await Category.create({
      name,
      color: color || '#3b82f6',
      icon: icon || '',
      user: req.userId
    });

    res.status(201).json({
      success: true,
      data: { category }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: { message: 'Category with this name already exists' } });
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: { message: 'Error creating category' } });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    const category = await Category.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }

    if (name !== undefined) category.name = name;
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;

    await category.save();

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: { message: 'Category with this name already exists' } });
    }
    console.error('Update category error:', error);
    res.status(500).json({ error: { message: 'Error updating category' } });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }

    // Update all tasks with this category to have no category
    await Task.updateMany(
      { category: category._id, user: req.userId },
      { $set: { category: null } }
    );

    await category.deleteOne();

    res.json({
      success: true,
      data: { message: 'Category deleted successfully' }
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: { message: 'Error deleting category' } });
  }
};
