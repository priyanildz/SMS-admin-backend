const mongoose = require("mongoose")

const studentLCSchema = mongoose.Schema({
    lc_no: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    studentid: {
        type: String,
        ref: "student",
        required: true
    },
    action:{
        type: String,   
        required:true,
        default: "LC"
    }
},
  {
    timestamps: true,
  }

)

module.exports = mongoose.model("student LC",studentLCSchema)