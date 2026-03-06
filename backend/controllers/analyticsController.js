const Task = require('../models/Task');
const Category = require('../models/Category');

// @desc    Get analytics overview
// @route   GET /api/analytics/overview
// @access  Private
exports.getOverview = async (req, res) => {
  try {
    const userId = req.userId;

    // Total tasks
    const totalTasks = await Task.countDocuments({ user: userId });

    // Completed tasks
    const completedTasks = await Task.countDocuments({
      user: userId,
      isCompleted: true
    });

    // Active tasks (not completed)
    const activeTasks = totalTasks - completedTasks;

    // Completion rate
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    // Current streaks
    const tasks = await Task.find({ user: userId });
    const totalCurrentStreak = tasks.reduce((sum, task) => sum + (task.streak?.current || 0), 0);
    const longestStreak = tasks.reduce((max, task) => Math.max(max, task.streak?.longest || 0), 0);

    // Tasks by category
    const tasksByCategory = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          }
        }
      }
    ]);

    // Populate category details
    const categoriesWithCounts = await Promise.all(
      tasksByCategory.map(async (item) => {
        if (item._id) {
          const category = await Category.findById(item._id);
          return {
            category: category ? {
              id: category._id,
              name: category.name,
              color: category.color,
              icon: category.icon
            } : null,
            count: item.count,
            completed: item.completed
          };
        }
        return {
          category: null,
          count: item.count,
          completed: item.completed
        };
      })
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalTasks,
          completedTasks,
          activeTasks,
          completionRate: parseFloat(completionRate),
          totalCurrentStreak,
          longestStreak,
          tasksByCategory: categoriesWithCounts
        }
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ error: { message: 'Error fetching analytics overview' } });
  }
};

// @desc    Get completion history
// @route   GET /api/analytics/history
// @access  Private
exports.getCompletionHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    const query = { user: userId };

    if (startDate && endDate) {
      query['completionHistory.date'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const tasks = await Task.find(query).select('title completionHistory streak');

    // Flatten completion history
    const allCompletions = [];
    tasks.forEach(task => {
      task.completionHistory.forEach(history => {
        if (!startDate || !endDate || 
            (history.date >= new Date(startDate) && history.date <= new Date(endDate))) {
          allCompletions.push({
            taskId: task._id,
            taskTitle: task.title,
            date: history.date,
            completed: history.completed
          });
        }
      });
    });

    // Sort by date
    allCompletions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        completions: allCompletions
      }
    });
  } catch (error) {
    console.error('Get completion history error:', error);
    res.status(500).json({ error: { message: 'Error fetching completion history' } });
  }
};

// @desc    Get streak statistics
// @route   GET /api/analytics/streaks
// @access  Private
exports.getStreakStats = async (req, res) => {
  try {
    const userId = req.userId;

    const tasks = await Task.find({ user: userId })
      .select('title streak category')
      .populate('category', 'name color icon');

    const streakData = tasks.map(task => ({
      taskId: task._id,
      taskTitle: task.title,
      category: task.category,
      currentStreak: task.streak?.current || 0,
      longestStreak: task.streak?.longest || 0,
      lastCompletedDate: task.streak?.lastCompletedDate
    }));

    // Sort by current streak (descending)
    streakData.sort((a, b) => b.currentStreak - a.currentStreak);

    res.json({
      success: true,
      data: {
        streaks: streakData
      }
    });
  } catch (error) {
    console.error('Get streak stats error:', error);
    res.status(500).json({ error: { message: 'Error fetching streak statistics' } });
  }
};

// @desc    Get daily completion stats for heatmap
// @route   GET /api/analytics/heatmap
// @access  Private
exports.getHeatmapData = async (req, res) => {
  try {
    const { year } = req.query;
    const userId = req.userId;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const tasks = await Task.find({ user: userId });

    // Create a map of date -> completion count
    const heatmapData = {};

    tasks.forEach(task => {
      task.completionHistory.forEach(history => {
        const date = new Date(history.date);
        if (date >= startDate && date <= endDate && history.completed) {
          const dateKey = date.toISOString().split('T')[0];
          heatmapData[dateKey] = (heatmapData[dateKey] || 0) + 1;
        }
      });
    });

    // Convert to array format
    const heatmapArray = Object.entries(heatmapData).map(([date, count]) => ({
      date,
      count
    }));

    res.json({
      success: true,
      data: {
        year: currentYear,
        heatmap: heatmapArray
      }
    });
  } catch (error) {
    console.error('Get heatmap data error:', error);
    res.status(500).json({ error: { message: 'Error fetching heatmap data' } });
  }
};
