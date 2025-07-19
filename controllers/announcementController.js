const announcement = require("../models/announcementModel");
// add announcement
exports.addAnnouncement = async (req, res) => {
  try {
    const response = new announcement(req.body);
    await response.save();
    return res.status(200).json({ message: "announcement added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get list of all announcement
exports.getAnnouncement = async (req, res) =>
{
  try
  { 
    const response = await announcement.find();
    return res.status(200).json(response)
  }
  catch(error)
  {
    return res.status(500).json({error: error.message})
  }
}