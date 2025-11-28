// const Questionpaper = require("../models/setModel");
// const Schedule = require("../models/scheduleQuestionP");

// exports.getSets = async (req, res) => {
//   try {
//     console.log("getSets called with params:", req.params);
//     const { standard, subject } = req.params;
    
//     // Validate parameters
//     if (!standard || !subject) {
//       return res.status(400).json({ error: "Standard and subject are required" });
//     }
    
//     console.log(`Fetching sets for standard: ${standard}, subject: ${subject}`);
    
//     // Get all sets for the standard and subject
//     const sets = await Questionpaper.find({ standard, subject });
//     console.log(`Found ${sets.length} sets`);
    
//     // Get all scheduled sets to check which ones are locked
//     const scheduledSets = await Schedule.find({ standard, subject });
//     console.log(`Found ${scheduledSets.length} scheduled sets`);
    
//     const scheduledUrls = scheduledSets.map(scheduled => scheduled.set);
    
//     // Add isScheduled flag to each set
//     const setsWithStatus = sets.map(set => {
//       const setObj = set.toObject ? set.toObject() : set;
//       return {
//         ...setObj,
//         isScheduled: scheduledUrls.includes(setObj.url)
//       };
//     });
    
//     console.log("Returning sets with status:", setsWithStatus);
//     res.json(setsWithStatus);
    
//   } catch (err) {
//     console.error("Error in getSets:", err);
//     console.error("Error stack:", err.stack);
//     res.status(500).json({ 
//       error: err.message,
//       details: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// };

// exports.createSets = async (req, res) => {
//     try {
//         console.log("createSets called with body:", req.body);
        
//         // Validate required fields
//         const { standard, subject, name, url } = req.body;
//         if (!standard || !subject || !name || !url) {
//             return res.status(400).json({ 
//                 error: "All fields (standard, subject, name, url) are required" 
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
//   try {
//     console.log("addSchedule called with body:", req.body);
//     const { standard, subject, set, schedule } = req.body;
    
//     // Validate required fields
//     if (!standard || !subject || !set || !schedule) {
//         return res.status(400).json({ 
//             error: "All fields (standard, subject, set, schedule) are required" 
//         });
//     }
    
//     // Check if this set is already scheduled
//     const existingSchedule = await Schedule.findOne({ standard, subject, set });
//     if (existingSchedule) {
//       console.log("Set already scheduled:", existingSchedule);
//       return res.status(400).json({ error: "This set is already scheduled" });
//     }
    
//     const newSchedule = new Schedule({ standard, subject, set, schedule });
//     await newSchedule.save();
//     console.log("Schedule created successfully:", newSchedule);
    
//     res.status(201).json({ message: "Scheduled successfully", data: newSchedule });
//   } catch (err) {
//     console.error("Error in addSchedule:", err);
//     res.status(500).json({ 
//         error: err.message,
//         details: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// };


const Questionpaper = require("../models/setModel");
const Schedule = require("../models/scheduleQuestionP");
const path = require('path');
const fs = require('fs');

// --- File Viewing Controller (NEW FUNCTION) ---
// This function reads the PDF file from the disk and sends it to the browser.
// The PDF files are assumed to be stored in a directory named 'uploads/question-papers' 
// relative to the server's root.
exports.viewPdf = (req, res) => {
    const { fileName } = req.params;
    // SECURITY NOTE: In a production environment, you must sanitize and validate 'fileName' 
    // to prevent directory traversal attacks (e.g., using path.join or path.resolve 
    // and checking against the safe uploads directory).
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'question-papers', fileName);

    console.log(`Attempting to serve file: ${filePath}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found." });
    }

    // Set headers to tell the browser it's a PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`); // 'inline' tells browser to display it

    // Stream the file
    fs.createReadStream(filePath).pipe(res);
};
// --- END NEW FUNCTION ---


// --- Existing functions remain unchanged (but shown for completeness) ---

exports.getSets = async (req, res) => {
  try {
    console.log("getSets called with params:", req.params);
    const { standard, subject } = req.params;
    
    if (!standard || !subject) {
      return res.status(400).json({ error: "Standard and subject are required" });
    }
    
    const sets = await Questionpaper.find({ standard, subject });
    
    // Use pdfPath for checking schedule lock
    const scheduledSets = await Schedule.find({ standard, subject });
    const scheduledPaths = scheduledSets.map(scheduled => scheduled.set); 
    
    const setsWithStatus = sets.map(set => {
      const setObj = set.toObject ? set.toObject() : set;
      return {
        ...setObj,
        isScheduled: scheduledPaths.includes(setObj.pdfPath) // Check against pdfPath
      };
    });
    
    res.json(setsWithStatus);
    
  } catch (err) {
    console.error("Error in getSets:", err);
    res.status(500).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.createSets = async (req, res) => {
    try {
        console.log("createSets called with body:", req.body);
        
        const { standard, subject, name, pdfPath } = req.body; // Expecting pdfPath
        if (!standard || !subject || !name || !pdfPath) {
            return res.status(400).json({ 
                error: "All fields (standard, subject, name, pdfPath) are required" 
            });
        }
        
        const newSet = new Questionpaper({ standard, subject, name, pdfPath });
        await newSet.save();
        
        res.status(201).json({ message: "Set created successfully", data: newSet });
    }
    catch (err) {
        console.error("Error in createSets:", err);
        res.status(500).json({ 
            error: err.message,
        });
    }
};

exports.addSchedule = async (req, res) => {
  try {
    console.log("addSchedule called with body:", req.body);
    const { standard, subject, set, schedule } = req.body; 
    
    if (!standard || !subject || !set || !schedule) {
        return res.status(400).json({ 
            error: "All fields (standard, subject, set, schedule) are required" 
        });
    }
    
    const existingSchedule = await Schedule.findOne({ standard, subject, set }); 
    if (existingSchedule) {
      return res.status(400).json({ error: "This set is already scheduled" });
    }
    
    const newSchedule = new Schedule({ standard, subject, set, schedule });
    await newSchedule.save();
    
    res.status(201).json({ message: "Scheduled successfully", data: newSchedule });
  } catch (err) {
    console.error("Error in addSchedule:", err);
    res.status(500).json({ 
        error: err.message,
    });
  }
};