const mongoose = require("mongoose")

const StudentTimeTable = mongoose.Schema({
    timetable_id:{
        type: String,
        required:true,
        default: Date.now()
    },
    standard:{
        type: String,
        required: true,
    },
    division:{
        type: String,
        required: true
    },
    slots:{
        day
    }
})