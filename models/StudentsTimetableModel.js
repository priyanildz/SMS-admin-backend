const mongoose = require("mongoose")

const StudentTimeTable = mongoose.Schema({
    timetable_id: {
        type: String,
        required: true,
        default: Date.now()
    },
    standard: {
        type: String,
        required: true,
    },
    division: {
        type: String,
        required: true
    },
    slots: [
        {
            day: {
                type: String,
                required: true,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            from: {
                type: String,
                required: true
            },
            to: {
                type: String,
                required: true
            },
            subject: {
                type: String,
                required: true
            },
            teacher: {
                type: String,
                required: true
            },
        }
    ]
})

module.exports = mongoose.model("studentTimetable", StudentTimeTable)