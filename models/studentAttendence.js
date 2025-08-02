const mongoose = require('mongoose')

const studentAttendence = new mongoose.Schema({
    date:{
        type: Date,
        required: true,
        default: Date.now()
    },
    std:{
        type: String,
        required: true
    },
    div: {
        type: String,
        required: true
    },
    students:{
        studentid:{
            type: String,
            required: true,
            ref: "studentid"
        },
        studentname:{
            type: String,
            required: true
        },
        remark:{
            type:String,
            required:true,
            enum: ['P','A']
        }
    }

})

module.exports = mongoose.model("studentAttendence",studentAttendence)