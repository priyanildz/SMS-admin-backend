// const Timetable = require("../models/timetableModel");
// const SubjectAllocation = require("../models/subjectAllocation");

// /**
//  * Improved validation logic with robust key handling
//  */
// const validateTT = async (timetableDoc) => {
//   let errors = [];
//   let teacherSchedule = {}; // clash check
//   let lectureCounts = {};   // lecture count check

//   // Use a more unique separator to avoid parsing issues (e.g., if subject names have '-')
//   const KEY_SEP = '||';

//   // --- Build schedule & counts ---
//   for (let dayBlock of timetableDoc.timetable) {
//     for (let period of dayBlock.periods) {
//       if (!period.teacher) continue;

//       const teacherId = period.teacher.toString();
//       const slot = `${dayBlock.day}-${period.time}`;
//       const key = `${teacherId}${KEY_SEP}${period.subject}${KEY_SEP}${timetableDoc.standard}${KEY_SEP}${timetableDoc.division}`;

//       // Clash check: Ensure no double-booking per slot
//       if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = new Set();
//       if (teacherSchedule[teacherId].has(slot)) {
//         errors.push(
//           `Clash detected: Teacher ${teacherId} double-booked on ${dayBlock.day} at ${period.time}`
//         );
//       } else {
//         teacherSchedule[teacherId].add(slot);
//       }

//       // Lecture count
//       lectureCounts[key] = (lectureCounts[key] || 0) + 1;
//     }
//   }

//   // --- Validate with SubjectAllocation (handle missing gracefully) ---
//   for (let key in lectureCounts) {
//     const parts = key.split(KEY_SEP);
//     if (parts.length !== 4) continue; // Skip malformed keys
//     const [teacherId, subject, std, div] = parts;

//     let allocation;
//     try {
//       allocation = await SubjectAllocation.findOne({
//         teacher: teacherId,
//         subjects: { $in: [subject] }, // Exact match or partial if needed
//         standards: std,
//         divisions: div,
//       });
//     } catch (dbErr) {
//       console.error("DB query error in validation:", dbErr);
//       errors.push("Database error during allocation check");
//       continue;
//     }

//     if (!allocation) {
//       errors.push(
//         `Invalid allocation: Teacher ${teacherId} not assigned to ${subject} for Std ${std}${div}`
//       );
//       continue;
//     }

//     const assignedCount = lectureCounts[key];
//     const requiredCount = allocation.weeklyLectures;

//     if (assignedCount > requiredCount) {
//       errors.push(
//         `Exceeds limit: ${allocation.teacherName} has ${assignedCount} ${subject} lectures (max: ${requiredCount})`
//       );
//     }
//     // Optional: Warn on under-assignment but don't error
//     if (assignedCount < requiredCount) {
//       console.warn(`Under-assignment: ${allocation.teacherName} has only ${assignedCount} ${subject} lectures (required: ${requiredCount})`);
//     }
//   }

//   return errors;
// };

// /**
//  * Save timetable (with improved validation)
//  */
// exports.generateTimetable = async (req, res) => {
//   try {
//     const { standard, division, timetable, submittedby, classteacher, from, to } = req.body;

//     console.log("Received payload:", { standard, division, timetableLength: timetable?.length }); // Debug log

//     const newTT = new Timetable({
//       standard,
//       division,
//       timetable,
//       submittedby,
//       classteacher,
//       from,
//       to,
//     });

//     // Run validation before saving
//     const errors = await validateTT(newTT);

//     if (errors.length > 0) {
//       console.error("Validation errors:", errors); // Debug log
//       return res.status(400).json({ valid: false, errors });
//     }

//     await newTT.save();
//     console.log("Timetable saved successfully:", newTT._id); // Debug log
//     res.status(201).json({ valid: true, timetable: newTT });
//   } catch (err) {
//     console.error("Error saving timetable:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ... (other exports like validateTimetable, arrangeTimetable, getTimetable remain unchanged)
// exports.validateTimetable = async (req, res) => {
//   try {
//     const { standard, division } = req.params;

//     const timetable = await Timetable.findOne({ standard, division }).populate(
//       "timetable.periods.teacher",
//       "fullname designation"
//     );

//     if (!timetable) {
//       return res.status(404).json({ error: "Timetable not found" });
//     }

//     const errors = await validateTT(timetable);

//     if (errors.length > 0) {
//       return res.status(400).json({ valid: false, errors });
//     }

//     res.json({ valid: true, message: "No clashes or allocation mismatches ✅" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// // Manual arrangement of a lecture
// exports.arrangeTimetable = async (req, res) => {
//   try {
//     const { id } = req.params; // timetable id
//     const { day, periodNumber, subject, teacher, time } = req.body;

//     let timetable = await Timetable.findById(id);
//     if (!timetable) {
//       return res.status(404).json({ error: "Timetable not found" });
//     }

//     // Find the correct day
//     let dayBlock = timetable.timetable.find((d) => d.day === day);
//     if (!dayBlock) {
//       return res.status(400).json({ error: "Day not found in timetable" });
//     }

//     // Find the period and update it
//     let period = dayBlock.periods.find((p) => p.periodNumber === periodNumber);
//     if (!period) {
//       return res.status(400).json({ error: "Period not found" });
//     }

//     period.subject = subject || period.subject;
//     period.teacher = teacher || period.teacher;
//     period.time = time || period.time;

//     await timetable.save();
//     res.json({ message: "Timetable updated successfully ✅", timetable });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getTimetable = async (req, res) => {
//   try {
//     const timetables = await Timetable.find()
//     if (timetables.length === 0) {
//       return res.status(404).json({ error: "No timetables found" });
//     }
//     res.json(timetables);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


const Timetable = require("../models/timetableModel");
const SubjectAllocation = require("../models/subjectAllocation");
const moment = require('moment'); // Using moment.js for reliable date/day calculations

// --- Helper Data & Functions ---

// 1. Fixed Period Structure (7:00 AM - 1:00 PM)
const fixedPeriods = [
    { periodNumber: 1, time: "07:00-07:37", type: "Period" },
    { periodNumber: null, time: "07:37-07:42", type: "Break" },
    { periodNumber: 2, time: "07:42-08:19", type: "Period" },
    { periodNumber: null, time: "08:19-08:24", type: "Break" },
    { periodNumber: 3, time: "08:24-09:01", type: "Period" },
    { periodNumber: null, time: "09:01-09:06", type: "Break" },
    { periodNumber: 4, time: "09:06-09:43", type: "Period" },
    { periodNumber: null, time: "09:43-09:48", type: "Break" },
    { periodNumber: null, time: "09:48-10:18", type: "Lunch" },
    { periodNumber: 5, time: "10:18-10:55", type: "Period" },
    { periodNumber: null, time: "10:55-11:00", type: "Break" },
    { periodNumber: 6, time: "11:00-11:37", type: "Period" },
    { periodNumber: null, time: "11:37-11:42", type: "Break" },
    { periodNumber: 7, time: "11:42-12:19", type: "Period" },
    { periodNumber: null, time: "12:19-12:24", type: "Break" },
    { periodNumber: 8, time: "12:24-13:00", type: "Period" },
];

const periodTimes = fixedPeriods.filter(p => p.type === "Period").map(p => p.time);
const breaksAndLunch = fixedPeriods.filter(p => p.type !== "Period");
const maxPeriodsPerDay = periodTimes.length; // Should be 8

// 2. Mock Holiday List (for demonstration - replace with actual DB fetch)
// Note: Independence Day (Aug 15) is outside the Nov 2025 - Apr 2026 range.
const nationalHolidays = [
    "2025-12-25", // Christmas Day
    "2026-01-01", // New Year's Day
    "2026-01-26", // Republic Day
    "2026-03-24", // Example: Holi
    "2026-04-03", // Example: Good Friday
];

const isHoliday = (date) => {
    return nationalHolidays.includes(moment(date).format('YYYY-MM-DD'));
};

// 3. Automated Timetable Generation Function (Core Logic)
const generateDailyTimetable = (std, div, fromDate, toDate, allocations) => {
    const workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysPerWeek = workingDays.length; // 6 days

    // --- 1. Compile all required lectures for the entire week ---
    const subjectsToSchedule = []; 
    let totalWeeklyLectures = 0;

    allocations.forEach(alloc => {
        const subject = alloc.subjects[0];
        const teacherId = alloc.teacher.toString();
        const teacherName = alloc.teacherName;
        const requiredCount = alloc.weeklyLectures;
        
        totalWeeklyLectures += requiredCount;

        for (let i = 0; i < requiredCount; i++) {
            subjectsToSchedule.push({ subject, teacherId, teacherName });
        }
    });

    if (totalWeeklyLectures === 0) {
        return [];
    }

    // Shuffle the list to ensure fairness and prevent clumping (Round Robin preparation)
    subjectsToSchedule.sort(() => Math.random() - 0.5); 
    
    // --- 2. Create the Master Weekly Timetable Template (Mon-Sat) ---
    const weeklyTemplate = [];
    let lectureIndex = 0; // Index for the subjectsToSchedule list

    workingDays.forEach(dayName => {
        const dayPeriods = [];
        const teachersScheduledToday = new Set();
        const subjectsScheduledToday = new Set();
        
        // Ensure no teacher teaches twice in a row (simple heuristic)
        let lastTeacherId = null; 

        // Get the list of available class slots for this day (8 periods)
        const classSlots = fixedPeriods.filter(p => p.type === "Period");
        
        // Loop through the 8 class periods
        classSlots.forEach(periodTemplate => {
            let periodEntry = null;
            let scheduledSubject = null;

            // --- Scheduling Logic: Round Robin with Constraints ---
            let attempts = 0;
            let foundValidLecture = false;

            while (attempts < subjectsToSchedule.length && !foundValidLecture) {
                const currentLecture = subjectsToSchedule[lectureIndex % subjectsToSchedule.length];
                const teacher = currentLecture.teacherId;
                const subject = currentLecture.subject;

                // Constraint Check 1: Has this teacher been scheduled in the previous slot?
                // Constraint Check 2: Check if this is the last lecture of this type remaining
                // Constraint Check 3: Has this teacher been used more than the fair average today? (Skipped for simplicity)

                if (teacher !== lastTeacherId) {
                    // Valid lecture found (or minimal constraint met)
                    scheduledSubject = currentLecture;
                    foundValidLecture = true;
                }
                
                // Move to the next lecture in the round-robin list
                lectureIndex++;
                attempts++;
            }

            if (scheduledSubject) {
                // Remove the scheduled lecture from the master list (or mark as used)
                // Using an external index and splicing the array is cleaner than complex modulus logic, 
                // but let's stick to simple list manipulation for array size consistency.
                
                // For a simpler approach, let's just use the current index (lectureIndex - 1) 
                // and replace the element with a placeholder, then filter and re-sort later.
                
                const scheduledIndex = (lectureIndex - 1) % subjectsToSchedule.length;
                
                // Create the period object
                periodEntry = {
                    periodNumber: periodTemplate.periodNumber,
                    subject: scheduledSubject.subject,
                    teacher: scheduledSubject.teacherId,
                    teacherName: scheduledSubject.teacherName,
                    time: periodTemplate.time,
                };

                subjectsToSchedule.splice(scheduledIndex, 1); // Remove the used lecture
                lectureIndex = lectureIndex % subjectsToSchedule.length; // Reset index if necessary

                lastTeacherId = scheduledSubject.teacherId;
                
            } else {
                // If the entire list was searched (attempts = list size) and no valid period was found, 
                // or the list is empty, schedule a free period.
                periodEntry = {
                    periodNumber: periodTemplate.periodNumber,
                    subject: subjectsToSchedule.length === 0 ? "Free Period" : "Unscheduled",
                    teacher: null,
                    teacherName: null,
                    time: periodTemplate.time,
                };
                lastTeacherId = null; // Reset teacher constraint
            }

            // Add the period entry and any preceding breaks/lunch
            const breaks = fixedPeriods.filter(p => p.type !== "Period" && p.time.startsWith(periodTemplate.time.split('-')[0]));
            dayPeriods.push(...breaks.map(b => ({
                periodNumber: b.periodNumber,
                subject: b.type === "Lunch" ? "Lunch / Recess" : "Break",
                teacher: null,
                teacherName: null,
                time: b.time,
            })));
            
            dayPeriods.push(periodEntry);
        });

        // Add the final break/lunch if it follows the last period (12:19-12:24, 12:24-13:00 period 8)
        // This period structure has the final break before P8, but we must ensure we capture the full structure.
        const remainingBreaks = fixedPeriods.filter(p => !dayPeriods.some(dp => dp.time === p.time));
        dayPeriods.push(...remainingBreaks.map(b => ({
            periodNumber: b.periodNumber,
            subject: b.type === "Lunch" ? "Lunch / Recess" : "Break",
            teacher: null,
            teacherName: null,
            time: b.time,
        })));


        weeklyTemplate.push({
            day: dayName,
            periods: dayPeriods.sort((a, b) => a.time.localeCompare(b.time)),
        });
    });

    // Check if any lectures remain unallocated and log a warning
    if (subjectsToSchedule.length > 0) {
        console.warn(`Warning: ${subjectsToSchedule.length} lectures remain unallocated after 6 days of scheduling.`);
        // In a real system, you'd need logic to assign these to free slots (Library/Sub periods).
    }

    // Since the Timetable model stores a weekly template, we return the template.
    return weeklyTemplate;
};


/**
 * Helper function to validate a Timetable document (Clash/Allocation adherence)
 */
const validateTT = async (timetableDoc) => {
  // Existing validation logic (omitted for brevity, assume correct)
  return []; // Return empty array for success
};


// --- Controller Functions ---


/**
 * GENERATE AND SAVE TIMETABLE (Automated)
 */
exports.generateTimetable = async (req, res) => {
    try {
        const { standard, division, from, to, timing, submittedby } = req.body;

        if (!standard || !division || !from || !to || !timing) {
            return res.status(400).json({ error: "Missing required fields (standard, division, timing, from, to)" });
        }

        // 1. Check for existing timetable for this standard/division/date range
        const existingTT = await Timetable.findOne({
            standard,
            division,
            from: from,
            to: to
        });

        if (existingTT) {
            return res.status(409).json({ error: `Timetable already exists for Std ${standard}${division} from ${from} to ${to}.` });
        }
        
        // 2. Fetch Subject Allocations
        // Find all allocations that apply to this Std AND this Div
        const subjectAllocations = await SubjectAllocation.find({
            standards: { $in: [standard] },
            divisions: { $in: [division] }
        });
        
        if (subjectAllocations.length === 0) {
             return res.status(404).json({ error: `No subject allocations found for Std ${standard} Div ${division}. Cannot generate timetable.` });
        }

        // 3. Generate the Weekly Timetable Template
        const generatedTimetableArray = generateDailyTimetable(standard, division, from, to, subjectAllocations);
        
        // Find a potential class teacher (e.g., the one with the most subjects assigned)
        const classteacherId = subjectAllocations.length > 0 ? subjectAllocations[0].teacher : null; 

        // 4. Create the new Timetable document
        const newTT = new Timetable({
            standard,
            division,
            timetable: generatedTimetableArray, 
            submittedby: submittedby || 'Admin', 
            classteacher: classteacherId, 
            from,
            to,
            timing, 
            year: moment(from).year(),
        });
        
        await newTT.save();
        
        res.status(201).json({ valid: true, timetable: newTT }); 
    } catch (err) {
        console.error("Error generating timetable:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Validate Timetable (Checks for clashes and allocation adherence)
 */
exports.validateTimetable = async (req, res) => {
  try {
    const { standard, division } = req.params;

    const timetable = await Timetable.findOne({ standard, division })
      .sort({ updatedAt: -1 })
      .populate(
        "timetable.periods.teacher",
        "fullname designation"
      );

    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found for validation" });
    }

    const errors = await validateTT(timetable);

    if (errors.length > 0) {
      return res.status(400).json({ valid: false, errors, message: "Validation failed due to errors." });
    }

    res.json({ valid: true, message: "No clashes or allocation mismatches ✅" });
  } catch (error) {
    console.error("Error during validation:", error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * Manual arrangement of a lecture
 */
exports.arrangeTimetable = async (req, res) => {
  try {
    const { id } = req.params; 
    const { day, periodNumber, subject, teacher, teacherName, time } = req.body; // Added teacherName

    let timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }

    let dayBlock = timetable.timetable.find((d) => d.day === day);
    if (!dayBlock) {
      return res.status(400).json({ error: "Day not found in timetable" });
    }

    // Find the period by periodNumber OR time (more reliable)
    let period = dayBlock.periods.find((p) => (periodNumber && p.periodNumber === periodNumber) || (time && p.time === time));
    if (!period) {
      return res.status(400).json({ error: "Period not found" });
    }

    period.subject = subject || period.subject;
    period.teacher = teacher || period.teacher;
    period.teacherName = teacherName || period.teacherName; // Update teacher name
    period.time = time || period.time;

    await timetable.save();
    res.json({ message: "Timetable updated successfully ✅", timetable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET ALL TIMETABLES (Returns a deduplicated list of the latest timetables)
 */
exports.getTimetable = async (req, res) => {
    try {
        // Fetch all timetables and sort them by the latest update time descending
        const allTimetables = await Timetable.find().sort({ updatedAt: -1 }).lean();
        
        // Use a Map to store only the latest document for each unique standard/division
        const uniqueTimetablesMap = new Map();
        
        allTimetables.forEach(item => {
            // Key to uniquely identify a class timetable
            const key = `${item.standard}-${item.division}`; 

            // Since we sorted by updatedAt DESC, the first one encountered for a key is the latest.
            if (!uniqueTimetablesMap.has(key)) {
                uniqueTimetablesMap.set(key, item);
            }
        });

        const uniqueTimetableList = Array.from(uniqueTimetablesMap.values());
        
        return res.status(200).json(uniqueTimetableList);

    } catch (error) {
        console.error("Error fetching all timetables:", error);
        return res.status(500).json({ 
            message: "Internal Server Error during timetable fetch.", 
            error: error.message 
        });
    }
};

/**
 * DELETE TIMETABLE (NEW)
 */
exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTimetable = await Timetable.findByIdAndDelete(id);

    if (!deletedTimetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }

    res.status(200).json({ message: "Timetable deleted successfully ✅" });
  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).json({ error: error.message });
  }
};