const express = require('express')

const chatController = require('../controllers/chat')

const loginRequired = require('../middleware/loginRequired')
const { body } = require('express-validator');

const router = express.Router()

router.post('/send-message',
    loginRequired,
    body('message').isLength({min:1}),
    body('sendTime').isISO8601(),
    body('to').isMobilePhone('any'),
    body('from').isMobilePhone('any'),
    chatController.sendMessage
)
router.post('/send-message-seen-info',
    loginRequired,
    body('seenTime').isISO8601(),
    body('to').isMobilePhone('any'),
    chatController.sendMessageSeenInfo,
    )
/*
router.post('/create-chatroom', loginRequired, chatController.createChatRoom)
router.get('/chatrooms', loginRequired, chatController.getChatRooms)
router.get('/get-paginated-messages',
    loginRequired,

    chatController.getPaginatedMessages
)

*/
router.get('/test', chatController.test)
module.exports = router