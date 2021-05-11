const jwt = require('jsonwebtoken')
const bcript = require('bcryptjs')

const User = require('../models/user')
const Validation = require('../middleware/validation')
const connections = require('../cache').connections
const socket = require('../socket')

exports.login = async (req, res, next) => {
    /*
    try{
        Validation(req.body)
            .string('phoneNumber')
            .validate()
    }catch (e){
        return res.status(e.statusCode).json({
            success: false,
            message: 'Missing parameters ' + e.message,
        })
    }*/

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
    /*
    try{
        Validation(req.body)
            .string('name')
            .string('phoneNumber')
            .validate()
    }catch (e){
        return res.status(e.statusCode).json({
            success: false,
            message: 'Missing parameters ' + e.message,
        })
    }*/

    const name = req.body.name
    const contactsPhoneNumbers = req.body.contactsPhoneNumbers
    const phoneNumber = req.body.phoneNumber
        .replace(/[A-Za-z\*()\s#\.,\+\/\;-]/g, '')

    if(phoneNumber.length < 10) {
        return res.status(e.statusCode).json({
            success: false,
            message: 'Invalid number',
        })
    }

    try {
        const existUsers = await User.find({phoneNumber: phoneNumber})
        if(existUsers.length){
            return res.json({
                success: false,
                message: 'This phone number already in use',
            })
        }

        //const hashedPassword = await bcript.hash(password, 12)
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
    /*
    try{
        Validation(req.body)
            .array('contacts')
            .validate()
    }catch (e){
        return res.status(e.statusCode).json({
            success: false,
            message: 'Missing parameters ' + e.message,
        })
    }*/

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

exports.disConnectSocket = (req, res, next) => {
    const phoneNumber = req.body.phoneNumber

    if(!phoneNumber){
        return res.json({
            success: false,
            message: 'Missing phone number'
        })
    }

    delete connections[phoneNumber]

    res.json({
        success: true
    })
}

exports.checkOnlineContacts = async (req, res, next) => {
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
