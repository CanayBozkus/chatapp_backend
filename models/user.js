const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Message = require('./message')
const socket = require('../socket')

const userSchema = new Schema({
    name: {
        required: true,
        type: String,
    },
    phoneNumber: {
        type: String,
        required: true
    },
    lastSeen: {
        type: Date,
        default: null
    },
    showLastSeen: {
        type: Boolean,
        default: true,
    },
    contacts: [{
        type: String,
    }]
}, { timestamps: { createdAt: 'createdAt' } })

userSchema.methods.checkUnreadMessages = async function (socketID) {
    const messages = await Message.find({receiver: this.phoneNumber})
    if(messages.length){
        socket.getIO().to(socketID).emit('message', messages)
        Message.deleteMany({receiver: this.phoneNumber}).exec()
    }
}

module.exports = mongoose.model('User', userSchema)