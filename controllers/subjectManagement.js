const subjectModel = require("../models/subjectsModel");

exports.addSubject = async (req, res) => {
  try {
    const { subjectname, standard } = req.body;
    if (!subjectname || !standard) {
      return res
        .status(400)
        .json({ message: "Subject name and standard are required" });
    }
    const newSubject = new subjectModel({ subjectname, standard });
    await newSubject.save();
    res
      .status(201)
      .json({ message: "Subject added successfully", subject: newSubject });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getSubjectsByStandard = async (req, res) => {
  try {
    const { standard } = req.params;
    const subjects = await subjectModel.find({ standard });
    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found for this standard" });
    }
    res.status(200).json({ subjects });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllSubjects = async (req, res) =>
{
  try
  {
    const response = await subjectModel.find();
    return res.status(200).json(response);
  }
  catch(error)
  {
    return res.status(500).error({error: error.message})
  }
}