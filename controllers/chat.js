const { validationResult } = require('express-validator');

const Message = require('../models/message')
const ChatRoom = require('../models/chatRoom')
const socket = require('../socket')
const connections = require('../cache').connections

exports.sendMessage = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const message = req.body.message
        const time = req.body.sendTime
        const receiverPhoneNumber = req.body.to
        const senderPhoneNumber = req.body.from

        const sendTime = new Date(time)

        const receiverConnectionID = connections[receiverPhoneNumber]

        if(receiverConnectionID){
            socket.getIO().to(receiverConnectionID).emit('message', {
                message,
                sendTime,
                to: receiverPhoneNumber,
                from: senderPhoneNumber
            })
        }
        else {
            const messageModel = new Message({
                from: senderPhoneNumber,
                to: receiverPhoneNumber,
                message: message,
                sendTime
            })

            await messageModel.save()
        }

        res.json({
            'success': true
        })
    }
    catch (e){
        console.log(e)
        res.json({
            success: false
        })
    }
}

exports.sendMessageSeenInfo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const seenTime = req.body.seenTime
    const receiverPhoneNumber = req.body.to
    const senderPhoneNumber = req.userPhoneNumber

    const socketID = connections[receiverPhoneNumber]

    if(socketID){
        socket.getIO().to(socketID).emit('message-seen', {from: senderPhoneNumber, seenTime})
    }

    res.json({
        success: true
    })
}





















exports.createChatRoom = async (req, res, next) => {
    try {
        const members = req.body.members
        const createdDateString = req.body.createdDate
        const createdDate = new Date(createdDateString['year'], createdDateString['month'], createdDateString['day'], createdDateString['hour'], createdDateString['minute'])

        const chatRoom = new ChatRoom({
            members: [...members, req.userId],
            createdDate,
            creator: req.userId,
            admins: [req.userId]
        })

        const result = await chatRoom.save()

        res.json(result)
    }
    catch (e){
        console.log(e)
        res.json({
            success: false
        })
    }
}

exports.getChatRooms = async (req, res, next) => {
    const chatRooms = await ChatRoom.find({'members': {$in: [req.userId]}})

    res.json(chatRooms)
}

exports.getPaginatedMessages = async (req, res, next) => {
    const chatRoomId = req.body.chatRoom
    const startTimeObj = req.body.messageQueryStartTime
    /*
    const errorResponse = {
        success: true,
        missing: "Missing"
    }

    if(!startTimeObj){
        errorResponse.missing += " time"
        errorResponse.success = false
    }

    if(!cio.on('disconnect', socket => {
            console.log(`Client disconnected ${socket}`)
        })hatRoomId){
        errorResponse.missing += " chatroom id"
        errorResponse.success = false
    }

    if(!errorResponse.success){
        return res.json(errorResponse)
    }
       */
    const startTime = new Date(
        startTimeObj['year'],
        startTimeObj['month'],
        startTimeObj['day'],
        startTimeObj['hour'],
        startTimeObj['minute'],
        startTimeObj['second'],
    )

    const messages = await Message.find({chatRoom: chatRoomId, sendTime: {$lte: startTime}}).limit(30)

    res.json(messages)
}

exports.test = (req, res, next) => {
    console.log(111)
    res.json({succes:true})
}