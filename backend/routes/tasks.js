const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.patch('/:id/complete', toggleTaskCompletion);
router.delete('/:id', deleteTask);

module.exports = router;
