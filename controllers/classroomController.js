const classroom = require("../models/classroomModel");
exports.addClassroom = async (req, res) => {
  try {
    const response = new classroom(req.body);
    await response.save();
    return res.status(200).json({ message: "added classroom successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getAllClassrooms = async (req, res) => {
    try {
        // Fetch all documents from the Classroom model
        const classrooms = await Classroom.find({}); 
        
        // Return the list of classrooms
        return res.status(200).json(classrooms);
    } catch (error) {
        console.error("Error fetching all classrooms:", error);
        return res.status(500).json({ message: "Internal Server Error while fetching classroom list." });
    }
};