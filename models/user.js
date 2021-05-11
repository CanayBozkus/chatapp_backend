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
    chatRooms: [{
        type: Schema.Types.ObjectId,
        ref: 'ChatRoom'
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