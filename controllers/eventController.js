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
    const response = await Event.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};