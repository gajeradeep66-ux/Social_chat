import express from 'express'
import { protectRoute } from '../middleware/authMiddleware.js';
import { 
        getAllContacts , 
        getMessagesByUserId ,  
        sendMessage,
        getChatPartners,
        deleteMessage,
    } from '../controllers/messageController.js'
import { arcjetProtection } from '../middleware/arcjetMiddleware.js';

const router = express.Router()

router.use( protectRoute , arcjetProtection )

router.get('/contacts', getAllContacts)
router.get('/chats', getChatPartners)
router.get('/:id',  getMessagesByUserId)

router.post('/send/:id', sendMessage)
router.delete('/:id', deleteMessage)

export default router;