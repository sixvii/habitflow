const Task = require('../models/Task');
const Category = require('../models/Category');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { category, completed, dueDate, startDate, endDate } = req.query;
    
    const query = { user: req.userId };
    
    if (category) query.category = category;
    if (completed !== undefined) query.isCompleted = completed === 'true';
    if (dueDate) query.dueDate = new Date(dueDate);
    if (startDate && endDate) {
      query.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const tasks = await Task.find(query)
      .populate('category', 'name color icon')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: { message: 'Error fetching tasks' } });
  }
};

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId
    }).populate('category', 'name color icon');

    if (!task) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: { message: 'Error fetching task' } });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      user: req.userId
    };

    // Validate category if provided
    if (taskData.category) {
      const category = await Category.findOne({
        _id: taskData.category,
        user: req.userId
      });
      if (!category) {
        return res.status(404).json({ error: { message: 'Category not found' } });
      }
    }

    const task = await Task.create(taskData);
    await task.populate('category', 'name color icon');

    res.status(201).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: { message: 'Error creating task' } });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    // Validate category if being updated
    if (req.body.category) {
      const category = await Category.findOne({
        _id: req.body.category,
        user: req.userId
      });
      if (!category) {
        return res.status(404).json({ error: { message: 'Category not found' } });
      }
    }

    Object.assign(task, req.body);
    await task.save();
    await task.populate('category', 'name color icon');

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: { message: 'Error updating task' } });
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/complete
// @access  Private
exports.toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;

    // Add to completion history
    if (task.isCompleted) {
      task.completionHistory.push({
        date: new Date(),
        completed: true
      });

      // Update streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (task.streak.lastCompletedDate) {
        const lastDate = new Date(task.streak.lastCompletedDate);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day
          task.streak.current += 1;
        } else if (diffDays > 1) {
          // Streak broken
          task.streak.current = 1;
        }
      } else {
        task.streak.current = 1;
      }

      task.streak.lastCompletedDate = today;
      if (task.streak.current > task.streak.longest) {
        task.streak.longest = task.streak.current;
      }
    }

    await task.save();
    await task.populate('category', 'name color icon');

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Toggle task completion error:', error);
    res.status(500).json({ error: { message: 'Error toggling task completion' } });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!task) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    res.json({
      success: true,
      data: { message: 'Task deleted successfully' }
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: { message: 'Error deleting task' } });
  }
};
