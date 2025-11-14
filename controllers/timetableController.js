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

// --- CRITICAL FIX: Ensure Mongoose and models are loaded ---
const mongoose = require('mongoose'); // **REQUIRED** to use mongoose.model()
const moment = require('moment'); 

// Safely access the models once Mongoose is connected in the main app file
const Timetable = mongoose.model('timetable');
const SubjectAllocation = mongoose.model('subjectallocation'); 
// -----------------------------------------------------------

// --- Helper Data & Functions (Unchanged) ---
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

const nationalHolidays = [
    "2025-12-25", "2026-01-01", "2026-01-26", "2026-03-24", "2026-04-03", 
];
const isHoliday = (date) => nationalHolidays.includes(moment(date).format('YYYY-MM-DD'));


// 3. Automated Timetable Generation Function (Core Logic - Unchanged, assuming working after array fix)
const generateDailyTimetable = (std, div, fromDate, toDate, allocations) => {
    const workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let subjectsToSchedule = []; 
    
    allocations.forEach(alloc => {
        for (let i = 0; i < alloc.weeklyLectures; i++) {
            subjectsToSchedule.push({ 
                subject: alloc.subjects[0], 
                teacherId: alloc.teacher.toString(), 
                teacherName: alloc.teacherName 
            });
        }
    });

    if (subjectsToSchedule.length === 0) return [];

    subjectsToSchedule.sort(() => Math.random() - 0.5); 
    
    const weeklyTemplate = [];
    let lectureIndex = 0; 
    
    workingDays.forEach(dayName => {
        const dayPeriods = [];
        let lastTeacherId = null; 
        const classSlots = fixedPeriods.filter(p => p.type === "Period");
        
        classSlots.forEach(periodTemplate => {
            let periodEntry = null;
            let scheduledLecture = null;
            let attempts = 0;
            let initialIndex = subjectsToSchedule.length > 0 ? lectureIndex % subjectsToSchedule.length : 0;
            
            while (attempts < subjectsToSchedule.length && subjectsToSchedule.length > 0) {
                const currentIndex = (initialIndex + attempts) % subjectsToSchedule.length;
                const currentLecture = subjectsToSchedule[currentIndex];
                
                if (currentLecture.teacherId !== lastTeacherId) {
                    scheduledLecture = currentLecture;
                    lectureIndex = currentIndex; 
                    break;
                }
                attempts++;
            }

            if (scheduledLecture) {
                subjectsToSchedule.splice(lectureIndex, 1);
                lectureIndex = subjectsToSchedule.length > 0 ? lectureIndex % subjectsToSchedule.length : 0;
                
                periodEntry = {
                    periodNumber: periodTemplate.periodNumber,
                    subject: scheduledLecture.subject,
                    teacher: scheduledLecture.teacherId,
                    teacherName: scheduledLecture.teacherName,
                    time: periodTemplate.time,
                };
                lastTeacherId = scheduledLecture.teacherId;
                
            } else {
                periodEntry = {
                    periodNumber: periodTemplate.periodNumber,
                    subject: subjectsToSchedule.length === 0 ? "Free Period" : "Unscheduled",
                    teacher: null,
                    teacherName: null,
                    time: periodTemplate.time,
                };
                lastTeacherId = null; 
            }

            const breaks = fixedPeriods.filter(p => p.type !== "Period" && p.time.split('-')[0] === periodTemplate.time.split('-')[0]);

            dayPeriods.push(...breaks.map(b => ({
                periodNumber: b.periodNumber,
                subject: b.type === "Lunch" ? "Lunch / Recess" : "Break",
                teacher: null,
                teacherName: null,
                time: b.time,
            })));
            dayPeriods.push(periodEntry);
        });

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

    if (subjectsToSchedule.length > 0) {
        console.warn(`Warning: ${subjectsToSchedule.length} lectures remain unallocated.`);
    }

    return weeklyTemplate;
};


// --- Validation Logic ---
const validateTT = async (timetableDoc) => {
  let errors = [];
  let teacherSchedule = {}; 
  let lectureCounts = {};   
  const KEY_SEP = '||';

  for (let dayBlock of timetableDoc.timetable) {
    for (let period of dayBlock.periods) {
      if (!period.teacher) continue;

      const teacherId = period.teacher.toString();
      const slot = `${dayBlock.day}-${period.time}`;
      const key = `${teacherId}${KEY_SEP}${period.subject}${KEY_SEP}${timetableDoc.standard}${KEY_SEP}${timetableDoc.division}`;

      if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = new Set();
      if (teacherSchedule[teacherId].has(slot)) {
        errors.push(`Clash detected: Teacher ${teacherId} double-booked on ${dayBlock.day} at ${period.time}`);
      } else {
        teacherSchedule[teacherId].add(slot);
      }
      lectureCounts[key] = (lectureCounts[key] || 0) + 1;
    }
  }

  for (let key in lectureCounts) {
    const parts = key.split(KEY_SEP);
    if (parts.length !== 4) continue;
    const [teacherId, subject, std, div] = parts;

    let allocation;
    try {
      allocation = await SubjectAllocation.findOne({
        teacher: teacherId,
        subjects: { $in: [subject] }, 
        standards: std,
        divisions: div,
      });
    } catch (dbErr) {
      console.error("DB query error in validation:", dbErr);
      errors.push("Database error during allocation check");
      continue;
    }

    if (!allocation) {
      errors.push(`Invalid allocation: Teacher ${teacherId} not assigned to ${subject} for Std ${std}${div}`);
      continue;
    }

    const assignedCount = lectureCounts[key];
    const requiredCount = allocation.weeklyLectures; 

    if (assignedCount > requiredCount) {
      errors.push(`Exceeds limit: Teacher ${teacherId} has ${assignedCount} ${subject} lectures (max: ${requiredCount})`);
    }
  }

  return errors;
};


// --- Controller Functions ---

exports.generateTimetable = async (req, res) => {
    try {
        const { standard, division, from, to, timing, submittedby } = req.body;

        if (!standard || !division || !from || !to || !timing) {
            return res.status(400).json({ error: "Missing required fields (standard, division, timing, from, to)" });
        }
        
        const existingTT = await Timetable.findOne({ standard, division, from, to });

        if (existingTT) {
            return res.status(409).json({ error: `Timetable already exists for Std ${standard}${division} from ${from} to ${to}.` });
        }
        
        const subjectAllocations = await SubjectAllocation.find({
            standards: { $in: [standard] },
            divisions: { $in: [division] }
        });
        
        if (subjectAllocations.length === 0) {
             return res.status(404).json({ error: `No subject allocations found for Std ${standard} Div ${division}. Cannot generate timetable.` });
        }

        const generatedTimetableArray = generateDailyTimetable(standard, division, from, to, subjectAllocations);
        
        const classteacherId = subjectAllocations.length > 0 ? subjectAllocations[0].teacher : null; 

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
        res.status(500).json({ error: "Timetable generation failed on the server: " + err.message }); 
    }
};

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

exports.arrangeTimetable = async (req, res) => {
  try {
    const { id } = req.params; 
    const { day, periodNumber, subject, teacher, teacherName, time } = req.body; 

    let timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }

    let dayBlock = timetable.timetable.find((d) => d.day === day);
    if (!dayBlock) {
      return res.status(400).json({ error: "Day not found in timetable" });
    }

    let period = dayBlock.periods.find((p) => (periodNumber && p.periodNumber === periodNumber) || (time && p.time === time));
    if (!period) {
      return res.status(400).json({ error: "Period not found" });
    }

    period.subject = subject || period.subject;
    period.teacher = teacher || period.teacher;
    period.teacherName = teacherName || period.teacherName; 
    period.time = time || period.time;

    await timetable.save();
    res.json({ message: "Timetable updated successfully ✅", timetable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTimetable = async (req, res) => {
    try {
        const allTimetables = await Timetable.find().sort({ updatedAt: -1 }).lean();
        
        const uniqueTimetablesMap = new Map();
        
        allTimetables.forEach(item => {
            const key = `${item.standard}-${item.division}`; 
            if (!uniqueTimetablesMap.has(key)) {
                uniqueTimetablesMap.set(key, item);
            }
        });

        const uniqueTimetableList = Array.from(uniqueTimetablesMap.values());
        
        return res.status(200).json(uniqueTimetableList);

    } catch (error) {
        console.error("Error fetching all timetables:", error);
        res.status(500).json({ 
            message: "Internal Server Error during timetable fetch.", 
            error: error.message 
        });
    }
};

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