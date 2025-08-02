const assessment = require("../models/assessmentModel");
const homework = require("../models/homeworkModel");
exports.addAssessment = async (req, res) => {
  try {
    const response = new assessment(req.body);
    await response.save();
    return res.status(200).json({ message: "assessment added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
exports.getAssessment = async (req, res) => {
  try {
    const response = await assessment.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// homework endpoints
exports.addHomework = async (req, res) => {
  try {
    const response = new homework(req.body);
    await response.save();
    return res.status(200).json({ message: "added homework successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// edit assessment
exports.editAssessment = async (req, res) => {
  try {
    const { _id } = req.params;
    const response = await assessment.findByIdAndUpdate(_id, req.body, {new: true});
    // console.log(response)
    return res.status(200).json({ message: "assessment added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
