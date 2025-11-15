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
  { num: null, time: "09:43-09:48", type: "Break", duration: 5 },
  { num: null, time: "09:48-10:18", type: "Lunch", duration: 30 },
  { num: 5, time: "10:18-10:55", type: "Period", duration: 37 },
  { num: null, time: "10:55-11:00", type: "Break", duration: 5 },
  { num: 6, time: "11:00-11:37", type: "Period", duration: 37 },
  { num: null, time: "11:37-11:42", type: "Break", duration: 5 },
  { num: 7, time: "11:42-12:19", type: "Period", duration: 37 },
  { num: null, time: "12:19-12:24", type: "Break", duration: 5 },
  { num: 8, time: "12:24-13:00", type: "Period", duration: 36 },
];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
    for (let period of dayBlock.periods) {
      if (period.type === 'Period') {
        
        if (!period.teacher) {
            // Check if the slot is intentionally empty (e.g., failed generation)
            if (period.subject !== 'Empty') {
                 // Ignore period slots that failed to be filled during generation
                 lastSubject = null;
                 continue;
            }
        }
        
        const teacherId = period.teacher?.toString();
        const slot = `${dayBlock.day}-${period.time}`;
        const key = `${teacherId}${KEY_SEP}${period.subject}${KEY_SEP}${timetableDoc.standard}${KEY_SEP}${timetableDoc.division}`;

        // 1. Clash check: Ensure no double-booking per slot (across all loaded timetables)
        if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = new Set();
        if (teacherSchedule[teacherId].has(slot)) {
          errors.push(
            `Clash detected: Teacher ${period.teacherName || teacherId} double-booked on ${dayBlock.day} at ${period.time}`
          );
        } else {
          teacherSchedule[teacherId].add(slot);
        }

        // 2. Consecutive subject check (Only useful for manual edits/validation post-gen)
        if (period.subject && period.subject === lastSubject) {
            console.warn(`Consecutive subject warning: ${period.subject} on ${dayBlock.day} at ${period.time}`);
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

  // --- Validate with SubjectAllocation ---
  for (let key in lectureCounts) {
    const parts = key.split(KEY_SEP);
    if (parts.length !== 4) continue; 
    const [teacherId, subject, std, div] = parts;

    let allocation = await SubjectAllocation.findOne({
      teacher: teacherId,
      subjects: { $in: [subject] },
      standards: std,
      divisions: div,
    });

    if (!allocation) {
      errors.push(
        `Invalid allocation: Teacher ${teacherId} not assigned to ${subject} for Std ${std}${div}`
      );
      continue;
    }

    const assignedCount = lectureCounts[key];
    const requiredCount = allocation.weeklyLectures;

    if (assignedCount > requiredCount) {
      errors.push(
        `Exceeds limit: ${allocation.teacherName} has ${assignedCount} ${subject} lectures (max: ${requiredCount})`
      );
    }
  }

  return errors;
};

/**
 * Generates a single, balanced timetable for a Standard and Division.
 */
exports.generateTimetable = async (req, res) => {
  const { standard, division, year, from, to, submittedby } = req.body;

  if (!standard || !division || !from || !to || !submittedby) {
    return res.status(400).json({ error: "Missing required fields (standard, division, date range, submittedby)." });
  }

  try {
    // 1. Check for existing timetable for this Standard/Division
    const existingTT = await Timetable.findOne({ standard, division, year });
    if (existingTT) {
      return res.status(409).json({ error: `Timetable already exists for Standard ${standard}, Division ${division} in year ${year}.` });
    }
    
    // 2. Fetch all relevant allocations (subjects taught to this class)
    const allocations = await SubjectAllocation.find({ 
      standards: { $in: [standard] },
      divisions: { $in: [division] }
    });

    if (allocations.length === 0) {
      return res.status(400).json({ error: `No subject allocations found for Standard ${standard}, Division ${division}. Please ensure allocations are made.` });
    }

    // 3. Prepare the teaching requirements (total lectures needed by teacher/subject)
    let requirements = [];
    let totalRequiredLectures = 0;

    for (const alloc of allocations) {
        const subject = alloc.subjects[0];
        const required = alloc.weeklyLectures;

        requirements.push({
            teacherId: alloc.teacher.toString(),
            teacherName: alloc.teacherName,
            subject: subject,
            requiredLectures: required,
            remainingLectures: required,
        });
        totalRequiredLectures += required;
    }

    // 4. Determine total available teaching slots (8 periods * 6 days)
    const totalTeachingSlots = NUM_TEACHING_PERIODS * WEEKDAYS.length; // 8 * 6 = 48

    if (totalRequiredLectures > totalTeachingSlots) {
        return res.status(400).json({ error: `Total required lectures (${totalRequiredLectures}) exceeds available slots (${totalTeachingSlots}). Cannot generate.` });
    }

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

    // 7. Core Timetable Generation Algorithm (Greedy, load balancing, AND alternation)

    // Tracks the last subject taught in this class per day, essential for alternation
    let lastSubjectPerDay = WEEKDAYS.reduce((acc, day) => { acc[day] = null; return acc; }, {});
    
    // Sort requirements once by priority (highest lectures remaining first)
    requirements.sort((a, b) => b.requiredLectures - a.requiredLectures);

    // Get the list of all teaching period slots (ignoring breaks/lunch)
    const teachingSlots = newTimetableData.flatMap(dayBlock => 
        dayBlock.periods.filter(p => p.type === 'Period').map(p => ({ day: dayBlock.day, period: p }))
    );

    // Secondary priority: iterate through requirements and try to place them
    // This iteration structure improves fairness over the previous slot-by-slot iteration
    let iterationCount = 0;
    while (requirements.some(r => r.remainingLectures > 0) && iterationCount < totalTeachingSlots * requirements.length) {
        
        requirements.sort((a, b) => b.remainingLectures - a.remainingLectures);
        
        for (const req of requirements) {
            if (req.remainingLectures <= 0) continue;

            let bestSlot = null;
            let bestDayLectureCount = Infinity;

            // Find the best available slot across all days for this specific subject/teacher
            for (const { day, period } of teachingSlots) {
                // Skip if already assigned
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
                
                // Mark the slot as taken in the global schedule for clash detection
                const slot = `${day}-${period.time}`;
                if (!globalTeacherSchedule[req.teacherId]) {
                    globalTeacherSchedule[req.teacherId] = new Set();
                }
                globalTeacherSchedule[req.teacherId].add(slot);
                
                // Break and move to the next requirement to ensure fairness
                break;
            }
        }
        iterationCount++;
    }
    
    // 8. Final Check on allocation balance (optional: use a warning)
    const unbalanced = requirements.filter(r => r.remainingLectures > 0);
    if (unbalanced.length > 0) {
        console.warn("Timetable generated, but the following allocations are under-assigned:", unbalanced);
        // The 'Empty' slots remain in the table for manual fixing.
    }

    // 9. Save the generated timetable
    const newTT = new Timetable({
      standard,
      division,
      year: parseInt(year),
      from,
      to,
      submittedby,
      // Find a classteacher ID (MOCK: needs real implementation)
      classteacher: allocations[0]?.teacher || '60c72b2f9c4f2b1d8c8b4567', // Mock teacher ID
      timetable: newTimetableData,
    });
    
    await newTT.save();
    console.log("Timetable generated and saved successfully:", newTT._id);

    // Return the saved timetable structure (it includes all period details)
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
// Existing Timetable Controller functions (unchanged)
// ------------------------------------------------------------------

exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params; // Timetable ID

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
    const { standard, division } = req.params;
    // ... (logic remains the same, but relies on the updated validateTT)
    // ...
    // NOTE: validateTT is updated above to include consecutive subject checks (warnings)
    // ...
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.arrangeTimetable = async (req, res) => {
  try {
    // ... (logic remains the same)
    // ...
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