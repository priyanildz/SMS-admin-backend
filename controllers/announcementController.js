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

// add announcement
exports.addAnnouncement = async (req, res) => {
  try {
    // Get the schedule date from the request body
    const { schedule, ...restOfBody } = req.body;
    
    // 🟢 NEW LOGIC: Determine the status based on the schedule date
    const scheduleDate = new Date(schedule);
    const currentDate = new Date();
    
    let initialStatus = "draft"; 
    
    // If the scheduled time is in the past or now, set status to 'sent'
    if (scheduleDate <= currentDate) {
      initialStatus = "sent";
    } else {
      // If the scheduled time is in the future, keep status as 'draft' (scheduled)
      initialStatus = "draft";
    }

    // Create the announcement object with the determined status
    const response = new announcement({
      ...restOfBody,
      schedule: scheduleDate, // Ensure schedule is a Date object
      status: initialStatus
    });

    await response.save();
    
    return res.status(200).json({ message: "announcement added successfully", data: response });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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

// modify draft mail to sent (used when manually sending a draft or when cron job executes a scheduled draft)
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