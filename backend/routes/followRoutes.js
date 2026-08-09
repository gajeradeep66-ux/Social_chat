import express from 'express';
import {
    getAllUsers,
    getUserById,
    sendFollowRequest,
    acceptFollowRequest,
    rejectFollowRequest,
    getFollowRequests,
    cancelFollowRequest,
} from '../controllers/followController.js';
import { protectRoute } from '../middleware/authMiddleware.js';
import { arcjetProtection } from '../middleware/arcjetMiddleware.js';

const router = express.Router();

router.use( protectRoute , arcjetProtection );

router.get('/requests', getFollowRequests);
router.get('/users', getAllUsers);
router.get('/user/:id', getUserById);

router.post('/request/:id', sendFollowRequest);
router.post('/accept/:id', acceptFollowRequest);
router.post('/reject/:id', rejectFollowRequest);
router.delete('/cancel/:id', cancelFollowRequest);

export default router;