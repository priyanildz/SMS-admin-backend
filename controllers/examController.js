const examModel = require("../models/examModel");
exports.addETimetable = async (req, res) => {
  try {
    const response = new examModel(req.body);
    await response.save();
    return res
      .status(200)
      .json({ message: "exam timetable created successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getETimetable = async (req, res) => {
  try {
    const response = await examModel.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getExamResults = async (req, res) => {
  try {
    const { standard, division, semester } = req.body;

    if (!standard || !division || !semester) {
      return res.status(400).json({ message: "Missing required filters (standard, division, semester)." });
    }
    const resultsData = await fetchResultsFromDatabase({ standard, division, semester });

    if (!resultsData || resultsData.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(resultsData);
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return res.status(500).json({ error: "Failed to fetch exam results." });
  }
};