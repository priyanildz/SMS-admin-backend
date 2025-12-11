// const announcement = require("../models/announcementModel");
// // add announcement
// exports.addAnnouncement = async (req, res) => {
//   try {
//     const response = new announcement(req.body);
//     await response.save();
//     return res.status(200).json({ message: "announcement added successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // get list of all announcement
// exports.getAnnouncement = async (req, res) => {
//   try {
//     const response = await announcement.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // modify draft mail to sent
// exports.updateAnnouncement = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const response = await announcement.findByIdAndUpdate(
//       id,
//       { status: "sent" },
//       { new: true }
//     );
//     return res.status(200).json({message:'updated successfully'})
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };



















// const announcement = require("../models/announcementModel");
// // add announcement
// exports.addAnnouncement = async (req, res) => {
//   try {
//     const response = new announcement(req.body);
//     await response.save();
//     // Return the created object for flexibility
//     return res.status(200).json({ message: "announcement added successfully", data: response });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // get list of all announcement
// exports.getAnnouncement = async (req, res) => {
//   try {
//     const response = await announcement.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // modify draft mail to sent
// exports.updateAnnouncement = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const response = await announcement.findByIdAndUpdate(
//       id,
//       { status: "sent" }, // 🔥 CHANGE: Status is "sent"
//       { new: true }
//     );
//     // Return the updated object
//     return res.status(200).json({message:'updated successfully', data: response})
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };




















const announcement = require("../models/announcementModel");

// Helper function for simple ID generation
const generateUniqueId = () => {
    return `ANN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// add announcement
exports.addAnnouncement = async (req, res) => {
  try {
    const { schedule, announcementId, ...restOfBody } = req.body;
    
    // FIX 1: Generate announcementId if it's missing from the frontend payload
    const finalAnnouncementId = announcementId || generateUniqueId();
    
    // Determine status based on the schedule date
    const scheduleDate = new Date(schedule);
    const currentDate = new Date();
    // If scheduled time is in the past or now, set status to 'sent', otherwise 'draft'
    let initialStatus = (scheduleDate <= currentDate) ? "sent" : "draft";

    // Create the announcement object with the determined status and generated ID
    const response = new announcement({
      ...restOfBody,
      announcementId: finalAnnouncementId,
      schedule: scheduleDate, 
      status: initialStatus
    });

    await response.save();
    
    return res.status(200).json({ message: "announcement added successfully", data: response });
  } catch (error) {
     // Return a more specific error message from Mongoose validation
     console.error("Mongoose Error:", error.message);
     const errorMessage = error.name === 'ValidationError' ? error.message : "Internal Server Error";
    return res.status(500).json({ error: errorMessage });
  }
};

// get list of all announcement
exports.getAnnouncement = async (req, res) => {
  try {
    const response = await announcement.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// modify draft mail to sent
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await announcement.findByIdAndUpdate(
      id,
      { status: "sent" }, 
      { new: true }
    );
    return res.status(200).json({message:'updated successfully', data: response})
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};