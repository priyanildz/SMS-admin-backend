const mongoose = require("mongoose");
const SubjectSchema = new mongoose.Schema(
    {
        subjectname: {
            type: [String],
            required: true
        },
        standard: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("subject", SubjectSchema);