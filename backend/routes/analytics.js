const express = require('express');
const router = express.Router();
const {
  getOverview,
  getCompletionHistory,
  getStreakStats,
  getHeatmapData
} = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.get('/overview', getOverview);
router.get('/history', getCompletionHistory);
router.get('/streaks', getStreakStats);
router.get('/heatmap', getHeatmapData);

module.exports = router;
