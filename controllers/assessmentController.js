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
    const response = await assessment.find()
      // Use populate to fetch the Staff document corresponding to the teacherId
      // and only select the name fields (firstname, lastname)
      .populate({
        path: 'teacherId', // The field in the assessment schema that stores the ID
        select: 'firstname lastname', // The fields from the Staff document to retrieve
      });
      
    // The structure needs to be adjusted in the frontend to handle the populated object.
    // e.g., item.teacherId.firstname instead of item.teacherName

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
