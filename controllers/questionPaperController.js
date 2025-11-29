// const Questionpaper = require("../models/setModel");
// const Schedule = require("../models/scheduleQuestionP");

// exports.getSets = async (req, res) => {
//   try {
//     console.log("getSets called with params:", req.params);
//     const { standard, subject } = req.params;
//     
//     // Validate parameters
//     if (!standard || !subject) {
//       return res.status(400).json({ error: "Standard and subject are required" });
//     }
//     
//     console.log(`Fetching sets for standard: ${standard}, subject: ${subject}`);
//     
//     // Get all sets for the standard and subject
//     const sets = await Questionpaper.find({ standard, subject });
//     console.log(`Found ${sets.length} sets`);
//     
//     // Get all scheduled sets to check which ones are locked
//     // Note: To enforce the lock, we must check for schedules where the time is in the future.
//     const now = new Date();
//     const scheduledSets = await Schedule.find({ 
//       standard, 
//       subject, 
//       schedule: { $gt: now } // Only consider schedules that are in the future
//     });
//     console.log(`Found ${scheduledSets.length} currently locked sets`);
//     
//     const scheduledUrls = scheduledSets.map(scheduled => scheduled.set);
//     
//     // Add isScheduled flag to each set
//     const setsWithStatus = sets.map(set => {
//       const setObj = set.toObject ? set.toObject() : set;
//       return {
//         ...setObj,
//         isScheduled: scheduledUrls.includes(setObj.url)
//       };
//     });
//     
//     console.log("Returning sets with status:", setsWithStatus);
//     res.json(setsWithStatus);
//     
//   } catch (err) {
//     console.error("Error in getSets:", err);
//     console.error("Error stack:", err.stack);
//     res.status(500).json({ 
//       error: err.message,
//       details: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// };

// exports.createSets = async (req, res) => {
//     try {
//         console.log("createSets called with body:", req.body);
        
//         // Validate required fields
//         const { standard, subject, name, pdfpath } = req.body;
//         if (!standard || !subject || !name || !pdfpath) {
//             return res.status(400).json({ 
//                 error: "All fields (standard, subject, name, pdf file) are required" 
//             });
//         }
        
//         const newSet = new Questionpaper(req.body);
//         await newSet.save();
//         console.log("Set created successfully:", newSet);
        
//         res.status(201).json({ message: "Set created successfully", data: newSet });
//     }
//     catch (err) {
//         console.error("Error in createSets:", err);
//         res.status(500).json({ 
//             error: err.message,
//             details: process.env.NODE_ENV === 'development' ? err.stack : undefined
//         });
//     }
// };

// exports.addSchedule = async (req, res) => {
//   try {
//     console.log("addSchedule called with body:", req.body);
//     const { standard, subject, set, schedule } = req.body;
//     
//     // Validate required fields
//     if (!standard || !subject || !set || !schedule) {
//         return res.status(400).json({ 
//             error: "All fields (standard, subject, set, schedule) are required" 
//         });
//     }
//     
//     // Check if this set is already scheduled
//     const existingSchedule = await Schedule.findOne({ standard, subject, set });
//     if (existingSchedule) {
//       console.log("Set already scheduled:", existingSchedule);
//       return res.status(400).json({ error: "This set is already scheduled" });
//     }
//     
//     const newSchedule = new Schedule({ standard, subject, set, schedule });
//     await newSchedule.save();
//     console.log("Schedule created successfully:", newSchedule);
//     
//     res.status(201).json({ message: "Scheduled successfully", data: newSchedule });
//   } catch (err) {
//     console.error("Error in addSchedule:", err);
//     res.status(500).json({ 
//         error: err.message,
//         details: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// };

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
    
    // Get all scheduled sets whose schedule time is GREATER THAN the current time ($gt: now)
    const now = new Date();
    const scheduledSets = await Schedule.find({ 
      standard, 
      subject, 
      schedule: { $gt: now } // Only retrieve schedules that are in the future
    });
    console.log(`Found ${scheduledSets.length} currently locked sets`);
    
    const scheduledUrls = scheduledSets.map(scheduled => scheduled.set);
    
    // Add isScheduled flag to each set
    const setsWithStatus = sets.map(set => {
      const setObj = set.toObject ? set.toObject() : set;
      return {
        ...setObj,
        isScheduled: scheduledUrls.includes(setObj.url) // uses setObj.url (as fixed in schema)
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
        // Removed pdfpath reference, now consistently using 'url'
        const { standard, subject, name, url } = req.body;
        if (!standard || !subject || !name || !url) {
            return res.status(400).json({ 
                error: "All fields (standard, subject, name, url) are required" 
            });
        }
        
        // Ensure we are mapping to the schema fields correctly
        const newSet = new Questionpaper({ standard, subject, name, url });
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
    
    // 1. Validate required fields
    if (!standard || !subject || !set || !schedule) {
        return res.status(400).json({ 
            error: "All fields (standard, subject, set, schedule) are required" 
        });
    }

    // 2. BUSINESS LOGIC: Check for any existing, future schedule for this standard/subject
    // This ensures only ONE exam is scheduled for the class at any given time.
    const now = new Date();
    const existingFutureSchedule = await Schedule.findOne({ 
      standard, 
      subject, 
      schedule: { $gt: now } 
    });
    
    if (existingFutureSchedule) {
      console.log("Another set is already scheduled in the future:", existingFutureSchedule);
      return res.status(400).json({ 
        error: `Set '${existingFutureSchedule.set}' is already scheduled for this class at ${existingFutureSchedule.schedule.toISOString()}. Only one future schedule is allowed.` 
      });
    }
    
    // 3. Check if THIS set (set URL) is already scheduled in the past or future.
    const existingSchedule = await Schedule.findOne({ standard, subject, set });
    if (existingSchedule) {
        // This check is mostly for preventing the *exact* same schedule from being created twice, 
        // regardless of past/future status, but is harmless here.
      console.log("This specific set is already scheduled:", existingSchedule);
      return res.status(400).json({ error: "This set has already been scheduled." });
    }
    
    // 4. Create new schedule
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