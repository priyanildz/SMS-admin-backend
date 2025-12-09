// const Event = require("../models/eventsModel");
// exports.addEvent = async (req, res) => {
//   try {
//     const response = new Event(req.body);
//     await response.save();
//     return res.status(200).json({ message: "added event successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // list of all events
// exports.getEvents = async (req, res) => {
//   try {
//     const response = await Event.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };








// controllers/eventsController.js

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
        // FIX: Use populate to fetch student names from the linked collection
        const response = await Event.find()
            .populate('participants', 'firstname lastname'); 

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params; // Get event ID from route parameters
        const result = await Event.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: "Event not found" });
        }
        return res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Use findByIdAndUpdate to find the event by its MongoDB _id and update it
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true } // new: true returns the updated document
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found." });
        }

        return res.status(200).json({ message: "Event updated successfully", data: updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        return res.status(500).json({ error: error.message });
    }
};