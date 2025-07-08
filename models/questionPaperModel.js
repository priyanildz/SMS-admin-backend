const QuestionPaperSchema = new mongoose.Schema({
  standard: {
    type: String,
    required: true,
  },
  subjectpapers: [
    {
      subject: { type: String, required: true },
      sets: {
        set1: { type: String }, 
        set2: { type: String },
        set3: { type: String },
      },
      selectedsset: {
        type: String, // url of selected set
        required: true
      },
      schedule: {
        type: String,
        enum: ["morning", "evening", "night"],
        required: true,
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("questionpaper", QuestionPaperSchema);