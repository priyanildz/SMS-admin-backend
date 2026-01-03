// const mongoose = require("mongoose");
// const SubjectSchema = new mongoose.Schema(
//     {
//         subjectname: {
//             type: [String],
//             required: true
//         },
//         standard: {
//             type: String,
//             required: true
//         }
//     },
//     { timestamps: true }
// );

// module.exports = mongoose.model("subject", SubjectSchema);


const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
    {
        standard: {
            type: String,
            required: true
        },
        // Changed from [String] to a detailed object array
        subjects: [{
            name: { type: String, required: true },
            type: { type: String, enum: ["Compulsory", "Optional"], required: true },
            nature: { type: [String], required: true }, // ["Theory", "Practical"]
            subSubjects: { type: [String], default: [] }
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("subject", SubjectSchema);