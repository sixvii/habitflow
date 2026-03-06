const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePreferences,
  deleteAccount
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/preferences', updatePreferences);
router.delete('/account', deleteAccount);

module.exports = router;
