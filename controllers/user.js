const jwt = require('jsonwebtoken')
const bcript = require('bcryptjs')
const { validationResult } = require('express-validator');

const User = require('../models/user')
const connections = require('../cache').connections
const socket = require('../socket')

exports.login = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const phoneNumber = req.body.phoneNumber.replace(/[A-Za-z\*()\s#\.,\+\/\;-]/g, '')

    const user = await User.findOne({phoneNumber: phoneNumber})

    if(!user){
        return res.json({
            'success': false,
            'message': 'No matched phone number found',
        })
    }

    const token = jwt.sign(
        {
            name: user.userName,
            phone: user.phoneNumber,
            id: user._id.toString(),
        },
        'chatappsecretkey',
    )
    res.json({
        token,
        success: true,
        user,
    })
}

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const name = req.body.name
    const contactsPhoneNumbers = req.body.contactsPhoneNumbers
    const phoneNumber = req.body.phoneNumber
        .replace(/[A-Za-z\*()\s#\.,\+\/\;-]/g, '')

    try {
        const existUsers = await User.find({phoneNumber: phoneNumber})
        if(existUsers.length){
            return res.json({
                success: false,
                message: 'This phone number already in use',
            })
        }

        const registeredContacts = await User.find({phoneNumber: {$in: contactsPhoneNumbers}})
        const registeredContactsPhoneNumbers = registeredContacts.map(user => user.phoneNumber)

        const user = new User({
            name,
            phoneNumber,
            contacts: registeredContactsPhoneNumbers,
            lastSeen: null
        })

        const result = await user.save()

        res.json({
            "success": true,
            registeredContactsPhoneNumbers,
        })
    }

    catch (e){
        console.log(e)
        res.json({
           "success": false,
        })
    }
}

exports.getRegisteredUsersFromContacts = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const contactsRaw = req.body.contacts
    const contacts = contactsRaw.map(number => number.replace(/[A-Za-z\*()\s#\.,\+\/\;-]/g, ''))

    const registeredUsers = await User.find({
        'phoneNumber': {
            $in: contacts
        }
    })

    res.json({
        success: true,
        users: registeredUsers.map(user => user.phoneNumber)
    })
}

exports.setSocketConnectionData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const phoneNumber = req.body.phoneNumber
        const socketID = req.body.socketID

        const user = await User.findOne({_id: req.userId})

        if(!user){
            return res.json({
                success: false,
                message: 'User not found'
            })
        }
        else if(user.phoneNumber !== phoneNumber){
            return res.json({
                success: false,
                message: 'Unauthorized event'
            })
        }

        connections[phoneNumber] = socketID
        console.log('in connection set')
        console.log(connections)
        user.lastSeen = null
        await user.save()
        user.checkUnreadMessages(socketID)
        res.json({
            success: true,
        })
    }
    catch (e){
        res.json({
            success: false,
        })
    }
}

exports.disConnectSocket = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const phoneNumber = req.body.phoneNumber

    if(!phoneNumber){
        return res.json({
            success: false,
            message: 'Missing phone number'
        })
    }

    delete connections[phoneNumber]

    const user = await User.findOne({phoneNumber: phoneNumber})
    user.lastSeen = Date.now();
    await user.save()
    socket.getIO().emit(phoneNumber, {online: false, lastSeen: user.showLastSeen ? user.lastSeen.toISOString(): null,})

    res.json({
        success: true
    })
}

exports.checkContactStatus = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const phoneNumber = req.body.phoneNumber

    const user = await User.findOne({phoneNumber: phoneNumber})

    res.json({
        success: true,
        lastSeen: user.showLastSeen ? user.lastSeen?.toISOString() : null,
        online: user.lastSeen ? false : true,
    })
}

exports.checkOnlineContacts = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const contactNumbers = req.body.contactsNumbers
    const userPhoneNumber = req.userPhoneNumber
    console.log(contactNumbers)
    const onlineContacts = []

    for(let number of contactNumbers){
        number in connections ? onlineContacts.push(number) : null
    }

    const senderSocketID = connections[userPhoneNumber]
    console.log('in online status check')
    console.log(senderSocketID)
    console.log(connections)
    socket.getIO().to(senderSocketID).emit('online-status', {onlineContacts})


    res.json({
        success: true
    })
}
