import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getPublicWidyaiswaras
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public endpoint to fetch Widyaiswaras details
router.get('/public-list', getPublicWidyaiswaras);

// All routes require authentication
router.use(protect);

// Read-only access for admins and stakeholders
router.get('/', restrictTo('super_admin', 'admin', 'stakeholder'), getAllUsers);
router.get('/:id', restrictTo('super_admin', 'admin', 'stakeholder'), getUserById);

// Write access restricted to super_admin or the user themselves for update
router.post('/', restrictTo('super_admin'), createUser);
router.put('/:id', (req, res, next) => {
  if (req.user.role === 'super_admin' || req.user.id === parseInt(req.params.id)) {
    return next();
  }
  return res.status(403).json({
    status: 'error',
    message: 'You do not have permission to update this user.'
  });
}, updateUser);
router.delete('/:id', restrictTo('super_admin'), deleteUser);

export default router;
