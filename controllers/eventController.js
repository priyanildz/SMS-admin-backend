const Event = require("../models/eventsModel");
exports.addEvent = async (req, res) => {
  try {
    const response = new Event(req.body);
    await response.save();
    return res.status(200).json({ message: "added event successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// list of all events
exports.getEvents = async (req, res) => {
    try {
        // If Student and Staff schemas are correctly referenced:
        const response = await Event.find()
            // Assume student model is referenced by the items in 'participants'
            .populate('participants', 'firstname lastname') 
            // Assume staff model is referenced by 'staffid'
            .populate('staffid', 'firstname lastname'); 

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};