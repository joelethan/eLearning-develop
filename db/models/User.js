const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    IsAuthenticated: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    register_date: {
        type: Date,
        default: Date.now
    },
    activity_data: {
        type: [{
            location: {
                type: String
            },
            browser: {
                type: Object
            },
            login_date: {
                type: Date,
                default: Date.now
            }
        }]
    }
})

module.exports = User = mongoose.model('users', UserSchema);
