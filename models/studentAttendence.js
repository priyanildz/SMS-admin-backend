const mongoose = require('mongoose')

const studentAttendance = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    std: {
        type: String,
        required: true
    },
    div: {
        type: String,
        required: true
    },
    students: [
        {
            studentid: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "student"
            },
            studentname: {
                type: String,
                required: true
            },
            remark: {
                type: String,
                required: true,
                enum: ['P', 'A']
            }
        }
    ]
});


module.exports = mongoose.model("studentAttendence", studentAttendance)