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
 * Note: Simplified validation here. The generation logic minimizes clashes, 
 * but this function remains important for manual edits.
 */
const validateTT = async (timetableDoc, existingSchedules = {}) => {
  let errors = [];
  let teacherSchedule = existingSchedules; // Existing schedules from other timetables
  let lectureCounts = {};   // lecture count check

  const KEY_SEP = '||';

  // --- Build schedule & counts for this timetable ---
  for (let dayBlock of timetableDoc.timetable) {
    for (let period of dayBlock.periods) {
      if (!period.teacher || period.type !== 'Period') continue;

      const teacherId = period.teacher.toString();
      const slot = `${dayBlock.day}-${period.time}`;
      const key = `${teacherId}${KEY_SEP}${period.subject}${KEY_SEP}${timetableDoc.standard}${KEY_SEP}${timetableDoc.division}`;

      // Clash check: Ensure no double-booking per slot (across all loaded timetables)
      if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = new Set();
      if (teacherSchedule[teacherId].has(slot)) {
        errors.push(
          `Clash detected: Teacher ${period.teacherName || teacherId} double-booked on ${dayBlock.day} at ${period.time}`
        );
      } else {
        teacherSchedule[teacherId].add(slot);
      }

      // Lecture count
      lectureCounts[key] = (lectureCounts[key] || 0) + 1;
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
      return res.status(400).json({ error: `No subject allocations found for Standard ${standard}, Division ${division}.` });
    }

    // 3. Prepare the teaching requirements (total lectures needed by teacher/subject)
    let requirements = [];
    let totalRequiredLectures = 0;

    for (const alloc of allocations) {
        // Since we decompose allocation on save, alloc.subjects and alloc.standards/divisions are single-item arrays.
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
            subject: p.type === 'Period' ? null : p.type, // Placeholder for period subjects
            teacher: null, // Placeholder for teacher ID
            teacherName: null, // Placeholder for teacher Name
            time: p.time,
        }))
    }));

    // 6. Fetch existing teacher schedules (to prevent clashes across all timetables)
    // This is crucial for real-world clash prevention
    const allTimetables = await Timetable.find({});
    let globalTeacherSchedule = {}; // Key: teacherId, Value: Set of time slots (e.g., 'Monday-07:00-07:37')

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

    // 7. Core Timetable Generation Algorithm (Greedy, load balancing)

    // Calculate the target average lectures per day to achieve fairness
    const totalPeriodSlots = newTimetableData.flatMap(day => day.periods.filter(p => p.periodNumber !== null));
    
    // Sort requirements by highest load first to prioritize fitting difficult schedules
    requirements.sort((a, b) => b.requiredLectures - a.requiredLectures);
    
    const PERIODS_PER_DAY = NUM_TEACHING_PERIODS;

    let dayLectureCount = WEEKDAYS.reduce((acc, day) => {
        acc[day] = 0;
        return acc;
    }, {});

    // Try to fill periods
    for (let i = 0; i < totalPeriodSlots.length; i++) {
        // Find the day block and period slot corresponding to this iteration
        const dayIndex = Math.floor(i / PERIODS_PER_DAY);
        const periodIndexInDay = i % PERIODS_PER_DAY;
        
        const dayName = WEEKDAYS[dayIndex];
        const dayBlock = newTimetableData[dayIndex];
        const periodSlot = dayBlock.periods.filter(p => p.periodNumber !== null)[periodIndexInDay];
        
        // Find the lowest utilized requirement that can be scheduled here
        let bestRequirement = null;
        let lowestDayCount = Infinity;

        // Shuffle requirements to avoid bias when loads are equal
        requirements.sort(() => 0.5 - Math.random());
        
        for (const req of requirements) {
            // Only consider requirements with remaining lectures
            if (req.remainingLectures > 0) {
                const teacherId = req.teacherId;
                const slot = `${dayName}-${periodSlot.time}`;
                
                // Check for clash (local and global)
                if (globalTeacherSchedule[teacherId]?.has(slot)) {
                    continue; // Clash with another class/timetable
                }
                
                // Check for daily load balance (try to keep daily count low)
                if (dayLectureCount[dayName] < lowestDayCount) {
                    lowestDayCount = dayLectureCount[dayName];
                    bestRequirement = req;
                }
            }
        }

        // If a valid requirement is found, assign it
        if (bestRequirement) {
            periodSlot.subject = bestRequirement.subject;
            periodSlot.teacher = bestRequirement.teacherId;
            periodSlot.teacherName = bestRequirement.teacherName;
            
            bestRequirement.remainingLectures--;
            dayLectureCount[dayName]++;
            
            // Mark the slot as taken in the global schedule for clash detection
            const slot = `${dayName}-${periodSlot.time}`;
            if (!globalTeacherSchedule[bestRequirement.teacherId]) {
                globalTeacherSchedule[bestRequirement.teacherId] = new Set();
            }
            globalTeacherSchedule[bestRequirement.teacherId].add(slot);
        } else {
             // If no teacher is available for any subject, leave the slot empty (e.g., for self-study/library)
             periodSlot.subject = "Self Study"; 
             periodSlot.teacher = null;
             periodSlot.teacherName = null;
        }
    }
    
    // 8. Final Check on allocation balance (optional: use a warning)
    const unbalanced = requirements.filter(r => r.remainingLectures > 0);
    if (unbalanced.length > 0) {
        console.warn("Timetable generated, but the following allocations are under-assigned:", unbalanced);
        // We proceed to save the generated timetable even with warnings
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
      classteacher: allocations[0]?.teacher || '60c72b2f9c4f2b1d8c8b4567', // Mock teacher ID, replace with actual lookup
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
// DELETE Timetable function (NEW)
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


// ------------------------------------------------------------------
// Existing Timetable Controller functions (updated to use new model fields)
// ------------------------------------------------------------------

exports.validateTimetable = async (req, res) => {
  try {
    const { standard, division } = req.params;

    // Load ALL timetables to check for global teacher clashes
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

    const timetable = await Timetable.findOne({ standard, division });

    if (!timetable) {
      // NOTE: Changed to return 200/false if not found, allowing client to generate new one.
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


// Manual arrangement of a lecture
exports.arrangeTimetable = async (req, res) => {
  try {
    const { id } = req.params; // timetable id
    // Assuming teacherName is also passed for display purposes
    const { day, periodNumber, subject, teacher, teacherName, time } = req.body; 

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
    period.teacherName = teacherName || period.teacherName; // Update teacher name
    period.time = time || period.time;

    // IMPORTANT: Re-run validation after manual change
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