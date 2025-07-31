const termAssessment = require("../models/termAssessment");
const Staff = require("../models/staffModel")
const classroom = require("../models/classroomModel");
exports.addTermResult = async (req, res) => {
  try {
    const { standard, division } = req.body;
    const foundClass = await classroom.findOne({ standard, division });
    if (!foundClass) {
      return res.status(404).json({ error: "classroom not found" });
    }

    // remaining by default adding those students present in respective class
    req.body.classroomid = foundClass._id;
    const response = new termAssessment(req.body);
    await response.save();
    return res
      .status(200)
      .json({ message: "added a term result successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getTermResults = async (req, res) => {
  try {
    const response = await termAssessment.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getResultsById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await termAssessment.findOne({ _id: id });

    const staffDetails = await Staff.findById(response.staffid)
    return res.status(200).json({
      ...response._doc,
      staffDetails
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};