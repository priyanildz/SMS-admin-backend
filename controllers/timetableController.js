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

// const Timetable = require("../models/timetableModel");
// const SubjectAllocation = require("../models/subjectAllocation");
// const Staff = require("../models/staffModel"); // Required to potentially get all staff

// // Fixed Period Schedule based on user requirements (Mon-Sat structure)
// const FIXED_PERIOD_STRUCTURE = [
//   { num: 1, time: "07:00-07:37", type: "Period", duration: 37 },
//   { num: null, time: "07:37-07:42", type: "Break", duration: 5 },
//   { num: 2, time: "07:42-08:19", type: "Period", duration: 37 },
//   { num: null, time: "08:19-08:24", type: "Break", duration: 5 },
//   { num: 3, time: "08:24-09:01", type: "Period", duration: 37 },
//   { num: null, time: "09:01-09:06", type: "Break", duration: 5 },
//   { num: 4, time: "09:06-09:43", type: "Period", duration: 37 },
//   { num: null, time: "09:43-10:13", type: "Lunch", duration: 30 }, // Lunch adjusted
//   { num: 5, time: "10:13-10:50", type: "Period", duration: 37 }, // Adjusted time
//   { num: null, time: "10:50-10:55", type: "Break", duration: 5 }, // Adjusted time
//   { num: 6, time: "10:55-11:32", type: "Period", duration: 37 }, // Adjusted time
//   { num: null, time: "11:32-11:37", type: "Break", duration: 5 }, // Adjusted time
//   { num: 7, time: "11:37-12:14", type: "Period", duration: 37 }, // Adjusted time
//   { num: null, time: "12:14-12:19", type: "Break", duration: 5 }, // Adjusted time
//   { num: 8, time: "12:19-12:55", type: "Period", duration: 36 }, // Adjusted time
// ];

// const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// const ALL_DIVISIONS = ["A", "B", "C", "D", "E", "F"]; // All divisions in the school
// const NUM_TEACHING_PERIODS = FIXED_PERIOD_STRUCTURE.filter(p => p.type === 'Period').length; // 8 periods

// /**
//  * Checks for clashes and allocation limits.
//  */
// const validateTT = async (timetableDoc, existingSchedules = {}) => {
//   let errors = [];
//   let teacherSchedule = existingSchedules; // clash check
//   let lectureCounts = {};   // lecture count check

//   const KEY_SEP = '||';

//   // --- Build schedule & counts for this timetable ---
//   for (let dayBlock of timetableDoc.timetable) {
//     let lastSubject = null;
//     let isPreviousPeriodBreak = false; 
//     for (let period of dayBlock.periods) {
//       // Check for consecutive breaks
//       if (period.type !== 'Period') {
//           if (isPreviousPeriodBreak && (period.type === 'Break' || period.type === 'Lunch')) {
//               errors.push(`Consecutive break/lunch detected: ${dayBlock.day} at ${period.time}`);
//           }
//           isPreviousPeriodBreak = true;
//       } else {
//           isPreviousPeriodBreak = false;
//       }
      
//       if (period.type === 'Period') {
        
//         const division = timetableDoc.division || 'ALL'; 
        
//         if (!period.teacher) {
//             if (period.subject !== 'Empty') {
//                  lastSubject = null;
//                  continue;
//             }
//         }
        
//         const teacherId = period.teacher?.toString();
//         const slot = `${dayBlock.day}-${period.time}`;
//         const key = `${teacherId}${KEY_SEP}${period.subject}${KEY_SEP}${timetableDoc.standard}${KEY_SEP}${division}`;

//         // 1. Clash check: Ensure no double-booking per slot (across all loaded timetables)
//         if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = new Set();
//         if (teacherSchedule[teacherId].has(slot)) {
//           errors.push(
//             `Clash detected: Teacher ${period.teacherName || teacherId} double-booked on ${dayBlock.day} at ${period.time}`
//           );
//         } else {
//           teacherSchedule[teacherId].add(slot);
//         }

//         // 2. Consecutive subject check 
//         if (period.subject && period.subject === lastSubject && period.subject !== 'Empty') {
//             console.warn(`Consecutive subject warning: ${period.subject} repeated on ${dayBlock.day} at ${period.time}`);
//             errors.push(`Consecutive subject warning: ${period.subject} repeated on ${dayBlock.day} at ${period.time}`);
//         }
//         lastSubject = period.subject;

//         // 3. Lecture count (only count if a teacher is assigned)
//         if (teacherId) {
//             lectureCounts[key] = (lectureCounts[key] || 0) + 1;
//         }
//       } else {
//           lastSubject = null; // Reset subject after a break/lunch
//       }
//     }
//   }
  
//   // Basic allocation limits check (optional, but good for stability)
//   return errors;
// };

// /**
//  * Generates a single, balanced timetable for a Standard (applied to all divisions).
//  */
// exports.generateTimetable = async (req, res) => {
//   // Academic Year is derived internally, not from request body
//   const { standard, from, to, submittedby, timing } = req.body; 
//   const year = new Date().getFullYear(); // Derive year based on current time

//   if (!standard || !from || !to || !submittedby) {
//     return res.status(400).json({ error: "Missing required fields (Standard, date range, submittedby)." });
//   }

//   try {
//     // 1. Check for existing timetable based only on Standard and Year
//     const existingTT = await Timetable.findOne({ standard, year });
//     if (existingTT) {
//       return res.status(409).json({ error: `Timetable template already exists for Standard ${standard} in year ${year}.` });
//     }
    
//     // 2. Fetch all relevant allocations for THIS STANDARD ACROSS ALL DIVISIONS
//     const allocations = await SubjectAllocation.find({ 
//       standards: { $in: [standard] },
//       divisions: { $in: ALL_DIVISIONS }
//     });

//     if (allocations.length === 0) {
//       return res.status(400).json({ error: `No subject allocations found for Standard ${standard} across any divisions. Please ensure allocations are made.` });
//     }
    
//     // 3. Aggregate Requirements and Calculate Total Required Periods
//     let pooledRequirements = {};
//     for (const alloc of allocations) {
//         const subject = alloc.subjects[0];
//         const required = alloc.weeklyLectures;
        
//         // Key the requirement by Teacher+Subject to handle shared allocation rules
//         const key = `${alloc.teacher.toString()}_${subject}`;
        
//         if (!pooledRequirements[key]) {
//              pooledRequirements[key] = {
//                  teacherId: alloc.teacher.toString(),
//                  teacherName: alloc.teacherName,
//                  subject: subject,
//                  requiredLectures: 0,
//                  remainingLectures: 0,
//              };
//         }
        
//         // Sum the lectures required for this teacher/subject across all allocated divisions
//         pooledRequirements[key].requiredLectures += required;
//         pooledRequirements[key].remainingLectures += required;
//     }
    
//     let requirements = Object.values(pooledRequirements);
    
//     const totalTeachingSlotsPerDivision = NUM_TEACHING_PERIODS * WEEKDAYS.length; // 48 slots
    
//     // 5. Initialize Timetable structure
//     let newTimetableData = WEEKDAYS.map(day => ({
//         day: day,
//         periods: FIXED_PERIOD_STRUCTURE.map(p => ({
//             periodNumber: p.num,
//             subject: p.type === 'Period' ? 'Empty' : p.type, // 'Empty' placeholder for period slots
//             teacher: null, 
//             teacherName: null, 
//             time: p.time,
//         }))
//     }));

//     // 6. Fetch existing teacher schedules (to prevent clashes across all timetables)
//     const allTimetables = await Timetable.find({});
//     let globalTeacherSchedule = {}; 

//     for (const tt of allTimetables) {
//         for (const dayBlock of tt.timetable) {
//             for (const period of dayBlock.periods) {
//                 if (period.teacher) {
//                     const teacherId = period.teacher.toString();
//                     const slot = `${dayBlock.day}-${period.time}`;
//                     if (!globalTeacherSchedule[teacherId]) {
//                         globalTeacherSchedule[teacherId] = new Set();
//                     }
//                     globalTeacherSchedule[teacherId].add(slot);
//                 }
//             }
//         }
//     }

//     // 7. Core Timetable Generation Algorithm (Alternation enforced)

//     let lastSubjectPerDay = WEEKDAYS.reduce((acc, day) => { acc[day] = null; return acc; }, {});
    
//     let iterationCount = 0;
//     while (requirements.some(r => r.remainingLectures > 0) && iterationCount < totalTeachingSlotsPerDivision * requirements.length * 2) { 
        
//         requirements.sort((a, b) => b.remainingLectures - a.remainingLectures);
        
//         let assignedInThisIteration = false;

//         for (const req of requirements) {
//             if (req.remainingLectures <= 0) continue;

//             let bestSlot = null;
//             let bestDayLectureCount = Infinity;

//             for (const { day, period } of teachingSlots) {
//                 if (period.subject !== 'Empty') continue; 
                
//                 const teacherId = req.teacherId;
//                 const slot = `${day}-${period.time}`;
//                 const currentDayLectureCount = newTimetableData.find(d => d.day === day).periods.filter(p => p.type === 'Period' && p.teacher).length;

//                 // CONSTRAINTS CHECK:
//                 // 1. Clash Check (Global)
//                 if (globalTeacherSchedule[teacherId]?.has(slot)) continue;
                
//                 // 2. Alternation Check (Local) - Prevent same subject twice in a row
//                 if (req.subject === lastSubjectPerDay[day]) continue;
                
//                 // 3. Load Balance Check (Local) - Prefer less utilized day
//                 if (currentDayLectureCount < bestDayLectureCount) {
//                     bestDayLectureCount = currentDayLectureCount;
//                     bestSlot = { day, period };
//                 }
//             }

//             // If a valid, non-consecutive, non-clashing slot is found, assign it
//             if (bestSlot) {
//                 const { day, period } = bestSlot;
                
//                 period.subject = req.subject;
//                 period.teacher = req.teacherId;
//                 period.teacherName = req.teacherName;
                
//                 req.remainingLectures--;
//                 lastSubjectPerDay[day] = req.subject;
                
//                 const slot = `${day}-${period.time}`;
//                 if (!globalTeacherSchedule[req.teacherId]) {
//                     globalTeacherSchedule[req.teacherId] = new Set();
//                 }
//                 globalTeacherSchedule[req.teacherId].add(slot);
                
//                 assignedInThisIteration = true;
//                 break;
//             }
//         }
        
//         if (!assignedInThisIteration && requirements.some(r => r.remainingLectures > 0)) {
//             break; 
//         }
        
//         iterationCount++;
//     }
    
//     // 8. Final Check on allocation balance (optional: use a warning)
//     const unbalanced = requirements.filter(r => r.remainingLectures > 0);
//     if (unbalanced.length > 0) {
//         console.warn(`Timetable generated, but ${unbalanced.length} requirements are under-assigned:`, unbalanced);
//     }

//     // 9. Save the generated timetable
//     const newTT = new Timetable({
//       standard,
//       year: year, 
//       from,
//       to,
//       submittedby,
//       // classteacher remains optional/mocked
//       classteacher: '60c72b2f9c4f2b1d8c8b4567', 
//       timetable: newTimetableData,
//       timing: timing // Save timing for display purposes
//     });
    
//     await newTT.save();
//     console.log("Timetable generated and saved successfully:", newTT._id);

//     return res.status(201).json({ 
//         message: "Timetable generated and saved successfully", 
//         timetable: newTT 
//     });

//   } catch (err) {
//     console.error("Error during timetable generation:", err);
//     res.status(500).json({ error: "Failed to generate timetable due to internal server error: " + err.message });
//   }
// };


// // ------------------------------------------------------------------
// // Existing Timetable Controller functions (updated for Standard-only lookup)
// // ------------------------------------------------------------------

// exports.deleteTimetable = async (req, res) => {
//   try {
//     const { id } = req.params; 
//     const deletedTimetable = await Timetable.findByIdAndDelete(id);

//     if (!deletedTimetable) {
//       return res.status(404).json({ error: "Timetable not found" });
//     }
//     res.status(200).json({ message: "Timetable deleted successfully ✅" });
//   } catch (error) {
//     console.error("Error deleting timetable:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.validateTimetable = async (req, res) => {
//   try {
//     const { standard } = req.params; 

//     const allTimetables = await Timetable.find({});
//     let existingSchedules = {};

//     for (const tt of allTimetables) {
//         for (const dayBlock of tt.timetable) {
//             for (const period of dayBlock.periods) {
//                 if (period.teacher) {
//                     const teacherId = period.teacher.toString();
//                     const slot = `${dayBlock.day}-${period.time}`;
//                     if (!existingSchedules[teacherId]) {
//                         existingSchedules[teacherId] = new Set();
//                     }
//                     existingSchedules[teacherId].add(slot);
//                 }
//             }
//         }
//     }

//     const timetable = await Timetable.findOne({ standard });

//     if (!timetable) {
//       return res.json({ valid: false, message: "Timetable not found for validation. Ready for generation." });
//     }

//     const errors = await validateTT(timetable, existingSchedules);

//     if (errors.length > 0) {
//       return res.status(400).json({ valid: false, errors });
//     }

//     res.json({ valid: true, message: "No clashes or allocation mismatches ✅" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// exports.arrangeTimetable = async (req, res) => {
//   try {
//     const { id } = req.params; 
//     // ... (rest of logic remains the same)
//     let timetable = await Timetable.findById(id);
//     if (!timetable) {
//       return res.status(404).json({ error: "Timetable not found" });
//     }

//     const errors = await validateTT(timetable);
//     if (errors.length > 0) {
//         return res.status(400).json({ valid: false, errors, message: "Manual update caused validation errors/clashes." });
//     }

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
const Staff = require("../models/staffModel"); 
const Subject = require("../models/subjectsModel"); // To check subject type (Optional/Activity)
const Classroom = require("../models/classroomModel"); // To find Class Teacher

// Fixed Period Schedule based on user requirements (Mon-Sat structure)
// const FIXED_PERIOD_STRUCTURE = [
//   { num: 1, time: "07:00-07:37", type: "Period", duration: 37 },
//   { num: null, time: "07:37-07:42", type: "Break", duration: 5 },
//   { num: 2, time: "07:42-08:19", type: "Period", duration: 37 },
//   { num: null, time: "08:19-08:24", type: "Break", duration: 5 },
//   { num: 3, time: "08:24-09:01", type: "Period", duration: 37 },
//   { num: null, time: "09:01-09:06", type: "Break", duration: 5 },
//   { num: 4, time: "09:06-09:43", type: "Period", duration: 37 },
//   { num: null, time: "09:43-10:13", type: "Lunch", duration: 30 }, 
//   { num: 5, time: "10:13-10:50", type: "Period", duration: 37 }, 
//   { num: null, time: "10:50-10:55", type: "Break", duration: 5 }, 
//   { num: 6, time: "10:55-11:32", type: "Period", duration: 37 }, 
//   { num: null, time: "11:32-11:37", type: "Break", duration: 5 }, 
//   { num: 7, time: "11:37-12:14", type: "Period", duration: 37 }, 
//   { num: null, time: "12:14-12:19", type: "Break", duration: 5 }, 
//   { num: 8, time: "12:19-12:55", type: "Period", duration: 36 }, 
// ];

// const FIXED_PERIOD_STRUCTURE = [
//   { num: 1, time: "07:00-07:55", type: "Period", duration: 55 },
//   { num: null, time: "07:55-08:00", type: "Break", duration: 5 },
//   { num: 2, time: "08:00-08:40", type: "Period", duration: 40 },
//   { num: null, time: "08:40-08:45", type: "Break", duration: 5 },
//   { num: 3, time: "08:45-09:25", type: "Period", duration: 40 },
//   { num: null, time: "09:25-09:30", type: "Break", duration: 5 },
//   { num: 4, time: "09:30-10:10", type: "Period", duration: 40 },
//   { num: null, time: "10:10-10:40", type: "Lunch", duration: 30 }, 
//   { num: 5, time: "10:40-11:20", type: "Period", duration: 40 }, 
//   { num: null, time: "11:20-11:25", type: "Break", duration: 5 }, 
//   { num: 6, time: "11:25-12:05", type: "Period", duration: 40 }, 
//   { num: null, time: "12:05-12:10", type: "Break", duration: 5 }, 
//   { num: 7, time: "12:10-01:00", type: "Period", duration: 50 }, 
// ];

const FIXED_PERIOD_STRUCTURE = [
  { num: 1, time: "08:00-08:30", type: "Period", isBreak: false },
  { num: 2, time: "08:30-09:00", type: "Period", isBreak: false },
  { num: 3, time: "09:00-09:30", type: "Period", isBreak: false },
  { num: 4, time: "09:30-10:00", type: "Period", isBreak: false },
  { num: null, time: "10:00-10:20", type: "Breakfast Break", isBreak: true },
  { num: 5, time: "10:20-10:50", type: "Period", isBreak: false },
  { num: 6, time: "10:50-11:20", type: "Period", isBreak: false },
  { num: 7, time: "11:20-11:50", type: "Period", isBreak: false },
  { num: 8, time: "11:50-12:20", type: "Period", isBreak: false },
];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Divisions A-E as per previous request
const ALL_DIVISIONS = ["A", "B", "C", "D", "E"]; 
const NUM_TEACHING_PERIODS = FIXED_PERIOD_STRUCTURE.filter(p => p.type === 'Period').length; 

const teachingSlots = [];
WEEKDAYS.forEach(day => {
    FIXED_PERIOD_STRUCTURE.forEach(period => {
        if (period.type === 'Period') {
            teachingSlots.push({ day, period });
        }
    });
});

const validateTT = async (timetableDoc, existingSchedules = {}) => {
  let errors = [];
  let teacherSchedule = existingSchedules; // clash check
  let lectureCounts = {};   // lecture count check

  const KEY_SEP = '||';

  // --- Build schedule & counts for this timetable ---
  for (let dayBlock of timetableDoc.timetable) {
    let lastSubject = null;
    let isPreviousPeriodBreak = false; 
    for (let period of dayBlock.periods) {
      // Check for consecutive breaks
      if (period.type !== 'Period') {
          if (isPreviousPeriodBreak && (period.type === 'Break' || period.type === 'Lunch')) {
              errors.push(`Consecutive break/lunch detected: ${dayBlock.day} at ${period.time}`);
          }
          isPreviousPeriodBreak = true;
      } else {
          isPreviousPeriodBreak = false;
      }
      
      if (period.type === 'Period') {
        
        const division = timetableDoc.division; 
        
        if (!period.teacher) {
            if (period.subject !== 'Empty') {
                 lastSubject = null;
                 continue;
            }
        }
        
        const teacherId = period.teacher?.toString();
        const slot = `${dayBlock.day}-${period.time}`;
        const key = `${teacherId}${KEY_SEP}${period.subject}${KEY_SEP}${timetableDoc.standard}${KEY_SEP}${division}`;

        // 1. Clash check: Ensure no double-booking per slot (across all loaded timetables)
        if (teacherId) {
            if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = new Set();
            if (teacherSchedule[teacherId].has(slot)) {
              errors.push(
                `Clash detected: Teacher ${period.teacherName || teacherId} double-booked on ${dayBlock.day} at ${period.time}`
              );
            } else {
              teacherSchedule[teacherId].add(slot);
            }
        }

        // 2. Consecutive subject check (Simplified logic for validation)
        if (period.subject && period.subject === lastSubject && period.subject !== 'Empty') {
            console.warn(`Consecutive subject warning: ${period.subject} repeated on ${dayBlock.day} at ${period.time}`);
            errors.push(`Consecutive subject warning: ${period.subject} repeated on ${dayBlock.day} at ${period.time}`);
        }
        lastSubject = period.subject;

        // 3. Lecture count (only count if a teacher is assigned)
        if (teacherId) {
            lectureCounts[key] = (lectureCounts[key] || 0) + 1;
        }
      } else {
          lastSubject = null; // Reset subject after a break/lunch
      }
    }
  }
  
  // Basic allocation limits check (optional, but good for stability)
  return errors;
};

exports.generateTimetable = async (req, res) => {
  const { standard, submittedby, timing } = req.body;
  
  // 1. Calculate Academic Year (April to March)
  const today = new Date();
  const currentMonth = today.getMonth(); 
  const academicStartYear = currentMonth <= 2 ? today.getFullYear() - 1 : today.getFullYear();
  const from = `${academicStartYear}-04-01`; 
  const to = `${academicStartYear + 1}-03-31`;
  const year = academicStartYear;

  try {
    const allExistingTimetables = await Timetable.find({});
    let globalTeacherSchedule = {};
    let teacherWeeklyLoad = {}; // 🚀 TRACKER: Max 40 lectures per week

    // Initialize global data from existing records
    allExistingTimetables.forEach(tt => {
      tt.timetable.forEach(dayBlock => {
        dayBlock.periods.forEach(p => {
          if (p.teacher) {
            const teacherId = p.teacher.toString();
            const key = `${dayBlock.day}-${p.time}`;
            if (!globalTeacherSchedule[teacherId]) globalTeacherSchedule[teacherId] = new Set();
            globalTeacherSchedule[teacherId].add(key);
            teacherWeeklyLoad[teacherId] = (teacherWeeklyLoad[teacherId] || 0) + 1;
          }
        });
      });
    });

    const subjectConfigs = await Subject.findOne({ standard });
    const allAllocations = await SubjectAllocation.find({ standards: standard });

    let generatedTimetables = [];

    for (const division of ALL_DIVISIONS) {
      const classroomInfo = await Classroom.findOne({ standard, division });
      if (!classroomInfo) continue;

      // 🚀 RULE 1: One teacher per subject in one class. 
      // If multiple teachers are allotted for a subject (e.g. English), 
      // we filter to ensure only one is picked for THIS division.
      const divisionAllocations = [];
      const subjectsInAlloc = [...new Set(allAllocations.flatMap(a => a.subjects))];

      subjectsInAlloc.forEach(subName => {
        const eligibleTeachers = allAllocations.filter(a => a.subjects.includes(subName));
        if (eligibleTeachers.length > 0) {
          // Randomly pick one teacher from the pool for this specific division
          const picked = eligibleTeachers[Math.floor(Math.random() * eligibleTeachers.length)];
          divisionAllocations.push(picked);
        }
      });

      let requirements = divisionAllocations.map(alloc => {
        const subjectName = alloc.subjects[0];
        const config = subjectConfigs?.subjects?.find(s => 
          s.name === subjectName || (s.subSubjects && s.subSubjects.includes(subjectName))
        );

        // 🚀 RULE: Dynamic Lecture Counts
        let count = 6; // Default for Compulsory: "As many as they can" (filling available slots)
        if (config?.type === 'Optional') count = 3; // 3 per week
        if (config?.nature?.includes('Activity')) count = 2; // 2 per week

        return {
          teacherId: alloc.teacher.toString(),
          teacherName: alloc.teacherName,
          subject: subjectName,
          type: config?.type || 'Compulsory',
          nature: config?.nature || [],
          remaining: count
        };
      });

      let newTimetableData = WEEKDAYS.map(day => ({
        day,
        periods: FIXED_PERIOD_STRUCTURE.map(p => ({
          periodNumber: p.num, subject: p.type === 'Period' ? 'Empty' : p.type,
          teacher: null, teacherName: null, time: p.time,
        }))
      }));

      // MANDATORY: Class Teacher 1st Period
      // MANDATORY: Class Teacher 1st Period
      newTimetableData.forEach(dayBlock => {
        const firstLec = dayBlock.periods[0];
        const classTrId = classroomInfo.staffid.toString();
        const slotKey = `${dayBlock.day}-${firstLec.time}`;
        
        // 1. First, check if the teacher is actually available
        const isTeacherBusy = globalTeacherSchedule[classTrId]?.has(slotKey);

        if (!isTeacherBusy) {
          // 2. Find ANY subject this teacher is allotted for in this standard
          // We look in allAllocations instead of just divisionAllocations
          const teacherAlloc = allAllocations.find(a => a.teacher.toString() === classTrId);
          
          firstLec.subject = teacherAlloc ? teacherAlloc.subjects[0] : "Class Teacher Period";
          firstLec.teacher = classroomInfo.staffid;
          firstLec.teacherName = teacherAlloc?.teacherName || classroomInfo.staffname;
          
          // 3. Update global tracking
          if (!globalTeacherSchedule[classTrId]) globalTeacherSchedule[classTrId] = new Set();
          globalTeacherSchedule[classTrId].add(slotKey);
          teacherWeeklyLoad[classTrId] = (teacherWeeklyLoad[classTrId] || 0) + 1;
          
          // 4. Important: Decrement remaining count if this subject was in the requirements
          const reqItem = requirements.find(r => r.subject === firstLec.subject && r.teacherId === classTrId);
          if (reqItem) reqItem.remaining--;

        } else {
          // If the teacher is genuinely busy (e.g., they are Class Teacher for 1A and this is 1B)
          firstLec.subject = "Free Lecture";
          firstLec.teacher = null;
          firstLec.teacherName = null;
        }
      });

      // CORE SCHEDULING
      for (let day of WEEKDAYS) {
        let dayBlock = newTimetableData.find(d => d.day === day);
        for (let i = 1; i < dayBlock.periods.length; i++) {
          let period = dayBlock.periods[i];
          if (period.subject !== 'Empty') continue;

          const candidate = requirements
            .filter(r => r.remaining > 0 && (teacherWeeklyLoad[r.teacherId] || 0) < 40) // 🚀 RULE: 40 Lec Cap
            .sort((a, b) => b.remaining - a.remaining)
            .find(r => {
              const slotKey = `${day}-${period.time}`;
              const dayCount = dayBlock.periods.filter(p => p.subject === r.subject).length;
              const prevPeriod = dayBlock.periods[i-1]?.type !== 'Period' ? dayBlock.periods[i-2] : dayBlock.periods[i-1];

              // 🚀 RULE: Repeats must be together (Double periods)
              const togetherRule = dayCount === 0 || (prevPeriod && prevPeriod.subject === r.subject);
              
              // 🚀 RULE: Optionals (3 total: 2 together, 1 separate)
              let optionalRule = true;
              if (r.type === 'Optional') {
                 optionalRule = dayCount < 2; // Max 2 per day to allow the (2+1) split
              }

              // 🚀 RULE: Activity (2 per week on different days)
              if (r.nature.includes('Activity') && dayCount >= 1) return false;

              return !globalTeacherSchedule[r.teacherId]?.has(slotKey) && togetherRule && optionalRule;
            });

          if (candidate) {
            period.subject = candidate.subject;
            period.teacher = candidate.teacherId;
            period.teacherName = candidate.teacherName;
            candidate.remaining--;
            
            const teacherId = candidate.teacherId;
            if (!globalTeacherSchedule[teacherId]) globalTeacherSchedule[teacherId] = new Set();
            globalTeacherSchedule[teacherId].add(`${day}-${period.time}`);
            teacherWeeklyLoad[teacherId] = (teacherWeeklyLoad[teacherId] || 0) + 1;
          }
        }
      }

      const newTT = new Timetable({
        standard, division, year, from, to, submittedby, timing, 
        timetable: newTimetableData, classteacher: classroomInfo.staffid
      });
      await newTT.save();
      generatedTimetables.push(newTT);
    }
    res.status(201).json({ message: "Timetables generated successfully with new constraints.", timetables: generatedTimetables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const data = await Timetable.find();
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.publishTimetable = async (req, res) => {
    try {
        const { standard } = req.params; 
        
        if (!standard) {
            return res.status(400).json({ error: "Missing required field: standard." });
        }
        
        // CRITICAL FIX: Generate the Date object correctly outside the update query.
        const publicationDate = new Date();

        const updateResult = await Timetable.updateMany(
            { standard: standard },
            { $set: { status: 'published', publishedAt: publicationDate } } 
        );

        if (updateResult.modifiedCount > 0) {
            res.status(200).json({ message: `Timetable successfully published for Standard ${standard} (${updateResult.modifiedCount} divisions updated).` });
        } else {
            res.status(404).json({ error: `No timetables found or updated for Standard ${standard}.` });
        }
    } catch (error) {
        console.error("Error publishing timetable:", error);
        res.status(500).json({ error: error.message });
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

exports.validateTimetable = async (req, res) => {
  try {
    const { standard } = req.params; 

    const allTimetables = await Timetable.find({});
    let existingSchedules = {};

    for (const tt of allTimetables) {
        for (const dayBlock of tt.timetable) {
            for (const period of dayBlock.periods) {
                if (period.teacher) {
                    const teacherId = period.teacher.toString();
                    const slot = `${dayBlock.day}-${period.time}`;
                    if (!existingSchedules[teacherId]) {
                        existingSchedules[teacherId] = new Set();
                    }
                    existingSchedules[teacherId].add(slot);
                }
            }
        }
    }

    const timetablesToValidate = await Timetable.find({ standard });

    if (timetablesToValidate.length === 0) {
      return res.json({ valid: false, message: "Timetable not found for validation. Ready for generation." });
    }

    let validationErrors = [];
    for (const tt of timetablesToValidate) {
        const errors = await validateTT(tt, existingSchedules);
        if (errors.length > 0) {
            validationErrors.push({ division: tt.division, errors });
        }
    }


    if (validationErrors.length > 0) {
      return res.status(400).json({ valid: false, errors: validationErrors });
    }

    res.json({ valid: true, message: "No clashes or allocation mismatches across all divisions for this standard ✅" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.arrangeTimetable = async (req, res) => {
  try {
    const { id } = req.params; 
    const { day, periodNumber, subject, teacher, time } = req.body;

    let timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }

    // Find the correct day
    let dayBlock = timetable.timetable.find((d) => d.day === day);
    if (!dayBlock) {
      return res.status(400).json({ error: "Day not found in timetable" });
    }

    // Find the period and update it
    let period = dayBlock.periods.find((p) => p.periodNumber === periodNumber);
    if (!period) {
      return res.status(400).json({ error: "Period not found" });
    }

    period.subject = subject || period.subject;
    period.teacher = teacher || period.teacher;
    period.time = time || period.time;

    // Run validation before saving
    const errors = await validateTT(timetable); 
    if (errors.length > 0) {
        return res.status(400).json({ valid: false, errors, message: "Manual update caused validation errors/clashes." });
    }

    await timetable.save();
    res.json({ message: "Timetable updated successfully ✅", timetable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.json(timetables || []); // Returns empty array instead of 404
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export the functions
module.exports = {
    generateTimetable: exports.generateTimetable,
    deleteTimetable: exports.deleteTimetable,
    validateTimetable: exports.validateTimetable,
    arrangeTimetable: exports.arrangeTimetable,
    getTimetable: exports.getTimetable,
    publishTimetable: exports.publishTimetable
};




















































// const Timetable = require("../models/timetableModel");
// const SubjectAllocation = require("../models/subjectAllocation");
// const Staff = require("../models/staffModel"); 

// // Fixed Period Schedule based on user requirements (Mon-Sat structure)
// const FIXED_PERIOD_STRUCTURE = [
//   { num: 1, time: "07:00-07:37", type: "Period", duration: 37 },
//   { num: null, time: "07:37-07:42", type: "Break", duration: 5 },
//   { num: 2, time: "07:42-08:19", type: "Period", duration: 37 },
//   { num: null, time: "08:19-08:24", type: "Break", duration: 5 },
//   { num: 3, time: "08:24-09:01", type: "Period", duration: 37 },
//   { num: null, time: "09:01-09:06", type: "Break", duration: 5 },
//   { num: 4, time: "09:06-09:43", type: "Period", duration: 37 },
//   { num: null, time: "09:43-10:13", type: "Lunch", duration: 30 }, 
//   { num: 5, time: "10:13-10:50", type: "Period", duration: 37 }, 
//   { num: null, time: "10:50-10:55", type: "Break", duration: 5 }, 
//   { num: 6, time: "10:55-11:32", type: "Period", duration: 37 }, 
//   { num: null, time: "11:32-11:37", type: "Break", duration: 5 }, 
//   { num: 7, time: "11:37-12:14", type: "Period", duration: 37 }, 
//   { num: null, time: "12:14-12:19", type: "Break", duration: 5 }, 
//   { num: 8, time: "12:19-12:55", type: "Period", duration: 36 }, 
// ];

// const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// // Divisions A-E as per previous request
// const ALL_DIVISIONS = ["A", "B", "C", "D", "E"]; 
// const NUM_TEACHING_PERIODS = FIXED_PERIOD_STRUCTURE.filter(p => p.type === 'Period').length; 

// const teachingSlots = [];
// WEEKDAYS.forEach(day => {
//     FIXED_PERIOD_STRUCTURE.forEach(period => {
//         if (period.type === 'Period') {
//             teachingSlots.push({ day, period });
//         }
//     });
// });


// /**
//  * Checks for clashes and allocation limits. (Remains Unchanged, but note the local check for consecutive subjects is simplified)
//  */
// const validateTT = async (timetableDoc, existingSchedules = {}) => {
//   let errors = [];
//   let teacherSchedule = existingSchedules; // clash check
//   let lectureCounts = {};   // lecture count check

//   const KEY_SEP = '||';

//   // --- Build schedule & counts for this timetable ---
//   for (let dayBlock of timetableDoc.timetable) {
//     let lastSubject = null;
//     let isPreviousPeriodBreak = false; 
//     for (let period of dayBlock.periods) {
//       // Check for consecutive breaks
//       if (period.type !== 'Period') {
//           if (isPreviousPeriodBreak && (period.type === 'Break' || period.type === 'Lunch')) {
//               errors.push(`Consecutive break/lunch detected: ${dayBlock.day} at ${period.time}`);
//           }
//           isPreviousPeriodBreak = true;
//       } else {
//           isPreviousPeriodBreak = false;
//       }
//       
//       if (period.type === 'Period') {
//         
//         const division = timetableDoc.division; 
//         
//         if (!period.teacher) {
//             if (period.subject !== 'Empty') {
//                  lastSubject = null;
//                  continue;
//             }
//         }
//         
//         const teacherId = period.teacher?.toString();
//         const slot = `${dayBlock.day}-${period.time}`;
//         const key = `${teacherId}${KEY_SEP}${period.subject}${KEY_SEP}${timetableDoc.standard}${KEY_SEP}${division}`;

//         // 1. Clash check: Ensure no double-booking per slot (across all loaded timetables)
//         if (teacherId) {
//             if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = new Set();
//             if (teacherSchedule[teacherId].has(slot)) {
//               errors.push(
//                 `Clash detected: Teacher ${period.teacherName || teacherId} double-booked on ${dayBlock.day} at ${period.time}`
//               );
//             } else {
//               teacherSchedule[teacherId].add(slot);
//             }
//         }

//         // 2. Consecutive subject check (Simplified logic for validation)
//         if (period.subject && period.subject === lastSubject && period.subject !== 'Empty') {
//             console.warn(`Consecutive subject warning: ${period.subject} repeated on ${dayBlock.day} at ${period.time}`);
//             errors.push(`Consecutive subject warning: ${period.subject} repeated on ${dayBlock.day} at ${period.time}`);
//         }
//         lastSubject = period.subject;

//         // 3. Lecture count (only count if a teacher is assigned)
//         if (teacherId) {
//             lectureCounts[key] = (lectureCounts[key] || 0) + 1;
//         }
//       } else {
//           lastSubject = null; // Reset subject after a break/lunch
//       }
//     }
//   }
//   
//   // Basic allocation limits check (optional, but good for stability)
//   return errors;
// };


// /**
//  * CORE CHANGE: Generates timetables for ALL divisions internally (A, B, C, D, E).
//  */
// exports.generateTimetable = async (req, res) => {
//   // Frontend only sends: standard, from, to, submittedby, timing
//   const { standard, from, to, submittedby, timing } = req.body; 
//   const year = new Date().getFullYear(); 

//   // 🛠️ FIX: Include 'timing' in the required fields validation to catch the 400 error.
//   if (!standard || !from || !to || !submittedby || !timing) { 
//     return res.status(400).json({ error: "Missing required fields (Standard, date range, submittedby, or timing)." });
//   }

//   let generatedTimetables = [];
//   let successfulDivisions = [];
//   let failedDivisions = [];

//   try {
//     // 1. Fetch ALL existing teacher schedules to prevent cross-division/cross-standard clashes
//     const allExistingTimetables = await Timetable.find({});
//     let globalTeacherSchedule = {}; 
//     for (const tt of allExistingTimetables) {
//         for (const dayBlock of tt.timetable) {
//             for (const period of dayBlock.periods) {
//                 if (period.teacher) {
//                     const teacherId = period.teacher.toString();
//                     const slot = `${dayBlock.day}-${period.time}`;
//                     if (!globalTeacherSchedule[teacherId]) {
//                         globalTeacherSchedule[teacherId] = new Set();
//                     }
//                     globalTeacherSchedule[teacherId].add(slot);
//                 }
//             }
//         }
//     }

//     // 2. Iterate through all required divisions (A, B, C, D, E)
//     for (const division of ALL_DIVISIONS) {
//         try {
//             // Check for existing timetable for this specific Standard/Division/Year
//             const existingTT = await Timetable.findOne({ standard, division, year });
//             if (existingTT) {
//                 failedDivisions.push({ division, error: "Timetable already exists." });
//                 continue;
//             }

//             // Fetch allocations for THIS SPECIFIC DIVISION
//             const allocations = await SubjectAllocation.find({ 
//                 standards: { $in: [standard] },
//                 divisions: { $in: [division] }
//             });

//             if (allocations.length === 0) {
//                 // ⚠️ IMPROVED ERROR REPORTING HERE
//                 failedDivisions.push({ division, error: "No subject allocations found for this Standard/Division." });
//                 continue;
//             }

//             // 3. Prepare Requirements
//             let requirements = allocations.map(alloc => ({
//                 teacherId: alloc.teacher.toString(),
//                 teacherName: alloc.teacherName,
//                 subject: alloc.subjects[0],
//                 requiredLectures: alloc.weeklyLectures,
//                 remainingLectures: alloc.weeklyLectures,
//             }));

//             // 4. Initialize Timetable structure
//             let newTimetableData = WEEKDAYS.map(day => ({
//                 day: day,
//                 periods: FIXED_PERIOD_STRUCTURE.map(p => ({
//                     periodNumber: p.num,
//                     subject: p.type === 'Period' ? 'Empty' : p.type, 
//                     teacher: null, 
//                     teacherName: null, 
//                     time: p.time,
//                 }))
//             }));

//             // 5. Core Generation Logic (Assignment Loop)
//             // No longer tracking last subject per day as we removed the constraint
//             let lastSubjectPerDay = WEEKDAYS.reduce((acc, day) => { acc[day] = null; return acc; }, {});
//             let iterationCount = 0;
//             const totalTeachingSlots = NUM_TEACHING_PERIODS * WEEKDAYS.length; 
//             
//             while (requirements.some(r => r.remainingLectures > 0) && iterationCount < totalTeachingSlots * requirements.length * 2) { 
//                 requirements.sort((a, b) => b.remainingLectures - a.remainingLectures);
//                 let assignedInThisIteration = false;

//                 for (const req of requirements) {
//                     if (req.remainingLectures <= 0) continue;

//                     let bestSlot = null;
//                     let bestDayLectureCount = Infinity;

//                     for (const { day, period } of teachingSlots) {
//                         const targetDayBlock = newTimetableData.find(d => d.day === day);
//                         const targetPeriod = targetDayBlock?.periods.find(p => p.time === period.time);

//                         if (!targetPeriod || targetPeriod.subject !== 'Empty') continue; 
//                         
//                         const teacherId = req.teacherId;
//                         const slot = `${day}-${period.time}`;
//                         const currentDayLectureCount = targetDayBlock.periods.filter(p => p.periodNumber !== null && p.teacher).length;

//                         // CONSTRAINTS CHECK
//                         if (globalTeacherSchedule[teacherId]?.has(slot)) continue;
//                         // ❌ REMOVED: if (req.subject === lastSubjectPerDay[day]) continue; 
//                         if (currentDayLectureCount < bestDayLectureCount) {
//                             bestDayLectureCount = currentDayLectureCount;
//                             bestSlot = { day, period: targetPeriod };
//                         }
//                     }

//                     if (bestSlot) {
//                         const { day, period } = bestSlot;
//                         
//                         period.subject = req.subject;
//                         period.teacher = req.teacherId;
//                         period.teacherName = req.teacherName;
//                         
//                         req.remainingLectures--;
//                         lastSubjectPerDay[day] = req.subject;
//                         
//                         // Update the GLOBAL schedule immediately to prevent the next division from clashing
//                         const slot = `${day}-${period.time}`;
//                         if (!globalTeacherSchedule[req.teacherId]) {
//                             globalTeacherSchedule[req.teacherId] = new Set();
//                         }
//                         globalTeacherSchedule[req.teacherId].add(slot);
//                         
//                         assignedInThisIteration = true;
//                         break;
//                     }
//                 }
//                 
//                 if (!assignedInThisIteration && requirements.some(r => r.remainingLectures > 0)) {
//                      break; 
//                 }
//                 iterationCount++;
//             } // END generation loop

//             // 6. FINAL CHECK: Did all required lectures get assigned?
//             const unassignedLectures = requirements.filter(r => r.remainingLectures > 0);
//             if (unassignedLectures.length > 0) {
//                 // ⚠️ IMPROVED ERROR REPORTING HERE
//                 const subjectsFailed = unassignedLectures.map(u => `${u.subject} (${u.remainingLectures} lectures left)`).join(', ');
//                 failedDivisions.push({ division, error: `Generation failed due to scheduling conflicts. Unassigned lectures: ${subjectsFailed}` });
//                 continue;
//             }


//             // 7. Save the generated timetable for this division
//             const newTT = new Timetable({
//                 standard,
//                 division, // Saving the specific division
//                 year: year, 
//                 from,
//                 to,
//                 submittedby,
//                 // Assuming this teacher ID is fetched/configured elsewhere
//                 classteacher: '60c72b2f9c4f2b1d8c8b4567', 
//                 timetable: newTimetableData,
//                 timing: timing 
//             });
//             
//             await newTT.save();
//             generatedTimetables.push(newTT);
//             successfulDivisions.push(division);

//         } catch (innerError) {
//             console.error(`Error processing division ${division}:`, innerError);
//             failedDivisions.push({ division, error: innerError.message });
//         }
//     } // END division loop

//     // 8. Final Response Summary
//     if (successfulDivisions.length > 0) {
//         return res.status(201).json({ 
//             message: `Timetables generated successfully for divisions: ${successfulDivisions.join(', ')}.`, 
//             timetables: generatedTimetables,
//             failedDivisions: failedDivisions,
//         });
//     } else {
//         // If all divisions failed
//         return res.status(400).json({ 
//             error: "Timetable generation failed for all divisions.", 
//             details: failedDivisions 
//         });
//     }

//   } catch (err) {
//     console.error("Critical error during multi-division timetable generation:", err);
//     res.status(500).json({ error: "Failed to generate timetables due to critical server error: " + err.message });
//   }
// };


// // ------------------------------------------------------------------
// // Existing Timetable Controller functions (kept for completeness)
// // ------------------------------------------------------------------

// exports.deleteTimetable = async (req, res) => {
//   try {
//     const { id } = req.params; 
//     const deletedTimetable = await Timetable.findByIdAndDelete(id);

//     if (!deletedTimetable) {
//       return res.status(404).json({ error: "Timetable not found" });
//     }
//     res.status(200).json({ message: "Timetable deleted successfully ✅" });
//   } catch (error) {
//     console.error("Error deleting timetable:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.validateTimetable = async (req, res) => {
//   try {
//     const { standard } = req.params; 

//     const allTimetables = await Timetable.find({});
//     let existingSchedules = {};

//     for (const tt of allTimetables) {
//         for (const dayBlock of tt.timetable) {
//             for (const period of dayBlock.periods) {
//                 if (period.teacher) {
//                     const teacherId = period.teacher.toString();
//                     const slot = `${dayBlock.day}-${period.time}`;
//                     if (!existingSchedules[teacherId]) {
//                         existingSchedules[teacherId] = new Set();
//                     }
//                     existingSchedules[teacherId].add(slot);
//                 }
//             }
//         }
//     }

//     const timetablesToValidate = await Timetable.find({ standard });

//     if (timetablesToValidate.length === 0) {
//       return res.json({ valid: false, message: "Timetable not found for validation. Ready for generation." });
//     }

//     let validationErrors = [];
//     for (const tt of timetablesToValidate) {
//         const errors = await validateTT(tt, existingSchedules);
//         if (errors.length > 0) {
//             validationErrors.push({ division: tt.division, errors });
//         }
//     }


//     if (validationErrors.length > 0) {
//       return res.status(400).json({ valid: false, errors: validationErrors });
//     }

//     res.json({ valid: true, message: "No clashes or allocation mismatches across all divisions for this standard ✅" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// exports.arrangeTimetable = async (req, res) => {
//   try {
//     const { id } = req.params; 
//     const { day, periodNumber, subject, teacher, time } = req.body;

//     let timetable = await Timetable.findById(id);
//     if (!timetable) {
//       return res.status(404).json({ error: "Timetable not found" });
//     }

//     // Find the correct day
//     let dayBlock = timetable.timetable.find((d) => d.day === day);
//     if (!dayBlock) {
//       return res.status(400).json({ error: "Day not found in timetable" });
//     }

//     // Find the period and update it
//     let period = dayBlock.periods.find((p) => p.periodNumber === periodNumber);
//     if (!period) {
//       return res.status(400).json({ error: "Period not found" });
//     }

//     period.subject = subject || period.subject;
//     period.teacher = teacher || period.teacher;
//     period.time = time || period.time;

//     // Run validation before saving
//     const errors = await validateTT(timetable); 
//     if (errors.length > 0) {
//         return res.status(400).json({ valid: false, errors, message: "Manual update caused validation errors/clashes." });
//     }

//     await timetable.save();
//     res.json({ message: "Timetable updated successfully ✅", timetable });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getTimetable = async (req, res) => {
//   try {
//     const timetables = await Timetable.find()
//     if (timetables.length === 0) {
//       return res.status(404).json({ error: "No timetables found" });
//     }
//     res.json(timetables);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };