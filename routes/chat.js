const express = require('express')

const chatController = require('../controllers/chat')

const loginRequired = require('../middleware/loginRequired')
const validation = require('../middleware/validation')

const router = express.Router()

router.post('/send-message',
    loginRequired,
    validation
        .string('message')
        .dateTime('sendTime')
        .phoneNumber('to')
        .phoneNumber('from')
        .exec(),
    chatController.sendMessage,
    )
router.post('/send-message-seen-info', loginRequired,
    validation
        .dateTime('seenTime')
        .phoneNumber('to')
        .exec(),
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
router.get('/test', validation.email('email').string('string').exec(), chatController.test)
module.exports = router