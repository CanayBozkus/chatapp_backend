const mongoose = require('mongoose')

const Schema = mongoose.Schema

const chatRoomSchema = new Schema({
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdDate: {
        type: Date,
        required: true,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
})

module.exports = mongoose.model('ChatRoom', chatRoomSchema)