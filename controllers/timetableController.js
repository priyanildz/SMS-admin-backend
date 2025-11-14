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

/**
 * Improved validation logic with robust key handling
 */
const validateTT = async (timetableDoc) => {
  let errors = [];
  let teacherSchedule = {}; // clash check
  let lectureCounts = {};   // lecture count check

  // Use a more unique separator to avoid parsing issues (e.g., if subject names have '-')
  const KEY_SEP = '||';

  // --- Build schedule & counts ---
  for (let dayBlock of timetableDoc.timetable) {
    for (let period of dayBlock.periods) {
      // Skip if subject indicates a break and teacher is null/empty
      if (period.subject && (period.subject.toLowerCase().includes('break') || period.subject.toLowerCase().includes('lunch')) && !period.teacher) continue;
      if (!period.teacher) continue;

      const teacherId = period.teacher.toString();
      const slot = `${dayBlock.day}-${period.time}`;
      const key = `${teacherId}${KEY_SEP}${period.subject}${KEY_SEP}${timetableDoc.standard}${KEY_SEP}${timetableDoc.division}`;

      // Clash check: Ensure no double-booking per slot
      if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = new Set();
      if (teacherSchedule[teacherId].has(slot)) {
        errors.push(
          `Clash detected: Teacher ${teacherId} double-booked on ${dayBlock.day} at ${period.time}`
        );
      } else {
        teacherSchedule[teacherId].add(slot);
      }

      // Lecture count
      lectureCounts[key] = (lectureCounts[key] || 0) + 1;
    }
  }

  // --- Validate with SubjectAllocation (handle missing gracefully) ---
  for (let key in lectureCounts) {
    const parts = key.split(KEY_SEP);
    if (parts.length !== 4) continue; // Skip malformed keys
    const [teacherId, subject, std, div] = parts;

    let allocation;
    try {
      // Find the subject allocation for this specific teacher/subject/std/div combination
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
      errors.push(
        `Invalid allocation: Teacher ${teacherId} not assigned to ${subject} for Std ${std}${div}`
      );
      continue;
    }

    const assignedCount = lectureCounts[key];
    // Assuming 'weeklyLectures' field exists on the SubjectAllocation model
    const requiredCount = allocation.weeklyLectures; 

    if (assignedCount > requiredCount) {
      errors.push(
        `Exceeds limit: Teacher ${teacherId} has ${assignedCount} ${subject} lectures (max: ${requiredCount})`
      );
    }
    // Optional: Warn on under-assignment but don't error
    if (assignedCount < requiredCount) {
      console.warn(`Under-assignment: Teacher ${teacherId} has only ${assignedCount} ${subject} lectures (required: ${requiredCount})`);
    }
  }

  return errors;
};

/**
 * Save timetable (with improved validation)
 */
exports.generateTimetable = async (req, res) => {
  try {
    const { standard, division, timetable, submittedby, classteacher, from, to } = req.body;

    const newTT = new Timetable({
      standard,
      division,
      timetable,
      submittedby,
      classteacher,
      from,
      to,
    });

    // Run validation before saving
    const errors = await validateTT(newTT);

    if (errors.length > 0) {
      console.error("Validation errors:", errors);
      return res.status(400).json({ valid: false, errors });
    }

    await newTT.save();
    res.status(201).json({ valid: true, timetable: newTT });
  } catch (err) {
    console.error("Error saving timetable:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Validate Timetable (Checks for clashes and allocation adherence)
 */
exports.validateTimetable = async (req, res) => {
  try {
    const { standard, division } = req.params;

    // Find the latest timetable for validation
    const timetable = await Timetable.findOne({ standard, division })
      .sort({ updatedAt: -1 }) // Ensure we validate the latest version
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
    const { id } = req.params; // timetable id
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
            // We only need to check if the key is already present.
            if (!uniqueTimetablesMap.has(key)) {
                uniqueTimetablesMap.set(key, item);
            }
        });

        const uniqueTimetableList = Array.from(uniqueTimetablesMap.values());
        
        // CRITICAL FIX: Always return 200 OK for a list endpoint, even if empty.
        // This helps prevent unexpected server redirects that cause CORS preflight failures.
        return res.status(200).json(uniqueTimetableList);

    } catch (error) {
        console.error("Error fetching all timetables:", error);
        return res.status(500).json({ 
            message: "Internal Server Error during timetable fetch.", 
            error: error.message 
        });
    }
};