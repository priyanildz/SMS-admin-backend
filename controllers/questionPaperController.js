const Questionpaper = require("../models/setModel");
const Schedule = require("../models/scheduleQuestionP");

exports.getSets = async (req, res) => {
  try {
    console.log("getSets called with params:", req.params);
    const { standard, subject } = req.params;
    
    // Validate parameters
    if (!standard || !subject) {
      return res.status(400).json({ error: "Standard and subject are required" });
    }
    
    console.log(`Fetching sets for standard: ${standard}, subject: ${subject}`);
    
    // Get all sets for the standard and subject
    const sets = await Questionpaper.find({ standard, subject });
    console.log(`Found ${sets.length} sets`);
    
    // Get all scheduled sets to check which ones are locked
    const scheduledSets = await Schedule.find({ standard, subject });
    console.log(`Found ${scheduledSets.length} scheduled sets`);
    
    const scheduledUrls = scheduledSets.map(scheduled => scheduled.set);
    
    // Add isScheduled flag to each set
    const setsWithStatus = sets.map(set => {
      const setObj = set.toObject ? set.toObject() : set;
      return {
        ...setObj,
        isScheduled: scheduledUrls.includes(setObj.url)
      };
    });
    
    console.log("Returning sets with status:", setsWithStatus);
    res.json(setsWithStatus);
    
  } catch (err) {
    console.error("Error in getSets:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.createSets = async (req, res) => {
    try {
        console.log("createSets called with body:", req.body);
        
        // Validate required fields
        const { standard, subject, name, url } = req.body;
        if (!standard || !subject || !name || !url) {
            return res.status(400).json({ 
                error: "All fields (standard, subject, name, url) are required" 
            });
        }
        
        const newSet = new Questionpaper(req.body);
        await newSet.save();
        console.log("Set created successfully:", newSet);
        
        res.status(201).json({ message: "Set created successfully", data: newSet });
    }
    catch (err) {
        console.error("Error in createSets:", err);
        res.status(500).json({ 
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.addSchedule = async (req, res) => {
  try {
    console.log("addSchedule called with body:", req.body);
    const { standard, subject, set, schedule } = req.body;
    
    // Validate required fields
    if (!standard || !subject || !set || !schedule) {
        return res.status(400).json({ 
            error: "All fields (standard, subject, set, schedule) are required" 
        });
    }
    
    // Check if this set is already scheduled
    const existingSchedule = await Schedule.findOne({ standard, subject, set });
    if (existingSchedule) {
      console.log("Set already scheduled:", existingSchedule);
      return res.status(400).json({ error: "This set is already scheduled" });
    }
    
    const newSchedule = new Schedule({ standard, subject, set, schedule });
    await newSchedule.save();
    console.log("Schedule created successfully:", newSchedule);
    
    res.status(201).json({ message: "Scheduled successfully", data: newSchedule });
  } catch (err) {
    console.error("Error in addSchedule:", err);
    res.status(500).json({ 
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};