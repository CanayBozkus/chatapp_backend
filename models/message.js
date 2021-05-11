const mongoose = require('mongoose')

const Schema = mongoose.Schema

const messageSchema = new Schema({
    from: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    sendTime: {
        type: Date,
        required: true,
    },
    to: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Message', messageSchema)