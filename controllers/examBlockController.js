const ExamBlock = require("../models/eblockModel");

exports.addExamBlock = async (req, res) => {
  try {
    const block = new ExamBlock(req.body);
    await block.save();
    res.status(201).json({ message: "Exam block added successfully", block });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const blocks = await ExamBlock.find();
    res.status(200).json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};