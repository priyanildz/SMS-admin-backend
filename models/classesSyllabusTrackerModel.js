const mongoose = require("mongoose");

const SyllabusTracker = mongoose.Schema({
    std:{
        type: String,
        required: true
    },
    div:{
        type: String,
        required: true
    },
    class_teacher:{
        type: String,
        required: true
    },
    subject:{
        type: String,
        required: true
    },
    pending:{
        type: mongoose.Schema.Types.Number,
        required: true
    },
    total:{
        type: mongoose.Schema.Types.Number,
        required: true
    }
})
module.exports = mongoose.model("SyllabusTracker", SyllabusTracker)