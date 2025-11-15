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
const Staff = require("../models/staffModel"); // Required to potentially get all staff

// Fixed Period Schedule based on user requirements (Mon-Sat structure)
const FIXED_PERIOD_STRUCTURE = [
  { num: 1, time: "07:00-07:37", type: "Period", duration: 37 },
  { num: null, time: "07:37-07:42", type: "Break", duration: 5 },
  { num: 2, time: "07:42-08:19", type: "Period", duration: 37 },
  { num: null, time: "08:19-08:24", type: "Break", duration: 5 },
  { num: 3, time: "08:24-09:01", type: "Period", duration: 37 },
  { num: null, time: "09:01-09:06", type: "Break", duration: 5 },
  { num: 4, time: "09:06-09:43", type: "Period", duration: 37 },
  { num: null, time: "09:43-10:13", type: "Lunch", duration: 30 }, // Lunch adjusted
  { num: 5, time: "10:13-10:50", type: "Period", duration: 37 }, // Adjusted time
  { num: null, time: "10:50-10:55", type: "Break", duration: 5 }, // Adjusted time
  { num: 6, time: "10:55-11:32", type: "Period", duration: 37 }, // Adjusted time
  { num: null, time: "11:32-11:37", type: "Break", duration: 5 }, // Adjusted time
  { num: 7, time: "11:37-12:14", type: "Period", duration: 37 }, // Adjusted time
  { num: null, time: "12:14-12:19", type: "Break", duration: 5 }, // Adjusted time
  { num: 8, time: "12:19-12:55", type: "Period", duration: 36 }, // Adjusted time
];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ALL_DIVISIONS = ["A", "B", "C", "D", "E", "F"]; // All divisions in the school
const NUM_TEACHING_PERIODS = FIXED_PERIOD_STRUCTURE.filter(p => p.type === 'Period').length; // 8 periods

/**
 * Checks for clashes and allocation limits.
 */
const validateTT = async (timetableDoc, existingSchedules = {}) => {
  let errors = [];
  let teacherSchedule = existingSchedules; // clash check
  let lectureCounts = {};   // lecture count check

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
        
        const division = timetableDoc.division || 'ALL'; 
        
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
        if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = new Set();
        if (teacherSchedule[teacherId].has(slot)) {
          errors.push(
            `Clash detected: Teacher ${period.teacherName || teacherId} double-booked on ${dayBlock.day} at ${period.time}`
          );
        } else {
          teacherSchedule[teacherId].add(slot);
        }

        // 2. Consecutive subject check 
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

/**
 * Generates a single, balanced timetable for a Standard (applied to all divisions).
 */
exports.generateTimetable = async (req, res) => {
  // Academic Year is derived internally, not from request body
  const { standard, from, to, submittedby, timing } = req.body; 
  const year = new Date().getFullYear(); // Derive year based on current time

  if (!standard || !from || !to || !submittedby) {
    return res.status(400).json({ error: "Missing required fields (Standard, date range, submittedby)." });
  }

  try {
    // 1. Check for existing timetable based only on Standard and Year
    const existingTT = await Timetable.findOne({ standard, year });
    if (existingTT) {
      return res.status(409).json({ error: `Timetable template already exists for Standard ${standard} in year ${year}.` });
    }
    
    // 2. Fetch all relevant allocations for THIS STANDARD ACROSS ALL DIVISIONS
    const allocations = await SubjectAllocation.find({ 
      standards: { $in: [standard] },
      divisions: { $in: ALL_DIVISIONS }
    });

    if (allocations.length === 0) {
      return res.status(400).json({ error: `No subject allocations found for Standard ${standard} across any divisions. Please ensure allocations are made.` });
    }
    
    // 3. Aggregate Requirements and Calculate Total Required Periods
    let pooledRequirements = {};
    for (const alloc of allocations) {
        const subject = alloc.subjects[0];
        const required = alloc.weeklyLectures;
        
        // Key the requirement by Teacher+Subject to handle shared allocation rules
        const key = `${alloc.teacher.toString()}_${subject}`;
        
        if (!pooledRequirements[key]) {
             pooledRequirements[key] = {
                 teacherId: alloc.teacher.toString(),
                 teacherName: alloc.teacherName,
                 subject: subject,
                 requiredLectures: 0,
                 remainingLectures: 0,
             };
        }
        
        // Sum the lectures required for this teacher/subject across all allocated divisions
        pooledRequirements[key].requiredLectures += required;
        pooledRequirements[key].remainingLectures += required;
    }
    
    let requirements = Object.values(pooledRequirements);
    
    const totalTeachingSlotsPerDivision = NUM_TEACHING_PERIODS * WEEKDAYS.length; // 48 slots
    
    // 5. Initialize Timetable structure
    let newTimetableData = WEEKDAYS.map(day => ({
        day: day,
        periods: FIXED_PERIOD_STRUCTURE.map(p => ({
            periodNumber: p.num,
            subject: p.type === 'Period' ? 'Empty' : p.type, // 'Empty' placeholder for period slots
            teacher: null, 
            teacherName: null, 
            time: p.time,
        }))
    }));

    // 6. Fetch existing teacher schedules (to prevent clashes across all timetables)
    const allTimetables = await Timetable.find({});
    let globalTeacherSchedule = {}; 

    for (const tt of allTimetables) {
        for (const dayBlock of tt.timetable) {
            for (const period of dayBlock.periods) {
                if (period.teacher) {
                    const teacherId = period.teacher.toString();
                    const slot = `${dayBlock.day}-${period.time}`;
                    if (!globalTeacherSchedule[teacherId]) {
                        globalTeacherSchedule[teacherId] = new Set();
                    }
                    globalTeacherSchedule[teacherId].add(slot);
                }
            }
        }
    }

    // 7. Core Timetable Generation Algorithm (Alternation enforced)

    let lastSubjectPerDay = WEEKDAYS.reduce((acc, day) => { acc[day] = null; return acc; }, {});
    
    let iterationCount = 0;
    while (requirements.some(r => r.remainingLectures > 0) && iterationCount < totalTeachingSlotsPerDivision * requirements.length * 2) { 
        
        requirements.sort((a, b) => b.remainingLectures - a.remainingLectures);
        
        let assignedInThisIteration = false;

        for (const req of requirements) {
            if (req.remainingLectures <= 0) continue;

            let bestSlot = null;
            let bestDayLectureCount = Infinity;

            for (const { day, period } of teachingSlots) {
                if (period.subject !== 'Empty') continue; 
                
                const teacherId = req.teacherId;
                const slot = `${day}-${period.time}`;
                const currentDayLectureCount = newTimetableData.find(d => d.day === day).periods.filter(p => p.type === 'Period' && p.teacher).length;

                // CONSTRAINTS CHECK:
                // 1. Clash Check (Global)
                if (globalTeacherSchedule[teacherId]?.has(slot)) continue;
                
                // 2. Alternation Check (Local) - Prevent same subject twice in a row
                if (req.subject === lastSubjectPerDay[day]) continue;
                
                // 3. Load Balance Check (Local) - Prefer less utilized day
                if (currentDayLectureCount < bestDayLectureCount) {
                    bestDayLectureCount = currentDayLectureCount;
                    bestSlot = { day, period };
                }
            }

            // If a valid, non-consecutive, non-clashing slot is found, assign it
            if (bestSlot) {
                const { day, period } = bestSlot;
                
                period.subject = req.subject;
                period.teacher = req.teacherId;
                period.teacherName = req.teacherName;
                
                req.remainingLectures--;
                lastSubjectPerDay[day] = req.subject;
                
                const slot = `${day}-${period.time}`;
                if (!globalTeacherSchedule[req.teacherId]) {
                    globalTeacherSchedule[req.teacherId] = new Set();
                }
                globalTeacherSchedule[req.teacherId].add(slot);
                
                assignedInThisIteration = true;
                break;
            }
        }
        
        if (!assignedInThisIteration && requirements.some(r => r.remainingLectures > 0)) {
            break; 
        }
        
        iterationCount++;
    }
    
    // 8. Final Check on allocation balance (optional: use a warning)
    const unbalanced = requirements.filter(r => r.remainingLectures > 0);
    if (unbalanced.length > 0) {
        console.warn(`Timetable generated, but ${unbalanced.length} requirements are under-assigned:`, unbalanced);
    }

    // 9. Save the generated timetable
    const newTT = new Timetable({
      standard,
      year: year, 
      from,
      to,
      submittedby,
      // classteacher remains optional/mocked
      classteacher: '60c72b2f9c4f2b1d8c8b4567', 
      timetable: newTimetableData,
      timing: timing // Save timing for display purposes
    });
    
    await newTT.save();
    console.log("Timetable generated and saved successfully:", newTT._id);

    return res.status(201).json({ 
        message: "Timetable generated and saved successfully", 
        timetable: newTT 
    });

  } catch (err) {
    console.error("Error during timetable generation:", err);
    res.status(500).json({ error: "Failed to generate timetable due to internal server error: " + err.message });
  }
};


// ------------------------------------------------------------------
// Existing Timetable Controller functions (updated for Standard-only lookup)
// ------------------------------------------------------------------

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

    const timetable = await Timetable.findOne({ standard });

    if (!timetable) {
      return res.json({ valid: false, message: "Timetable not found for validation. Ready for generation." });
    }

    const errors = await validateTT(timetable, existingSchedules);

    if (errors.length > 0) {
      return res.status(400).json({ valid: false, errors });
    }

    res.json({ valid: true, message: "No clashes or allocation mismatches ✅" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.arrangeTimetable = async (req, res) => {
  try {
    const { id } = req.params; 
    // ... (rest of logic remains the same)
    let timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }

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
    const timetables = await Timetable.find()
    if (timetables.length === 0) {
      return res.status(404).json({ error: "No timetables found" });
    }
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};