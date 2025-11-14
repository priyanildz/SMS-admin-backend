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

// /**
//  * Improved validation logic with robust key handling
//  */
// const validateTT = async (timetableDoc) => {
//   let errors = [];
//   let teacherSchedule = {}; // clash check
//   let lectureCounts = {};   // lecture count check

//   // Use a more unique separator to avoid parsing issues (e.g., if subject names have '-')
//   const KEY_SEP = '||';

//   // --- Build schedule & counts ---
//   for (let dayBlock of timetableDoc.timetable) {
//     for (let period of dayBlock.periods) {
//       // Skip if subject indicates a break and teacher is null/empty
//       if (period.subject && (period.subject.toLowerCase().includes('break') || period.subject.toLowerCase().includes('lunch')) && !period.teacher) continue;
//       if (!period.teacher) continue;

//       const teacherId = period.teacher.toString();
//       const slot = `${dayBlock.day}-${period.time}`;
//       const key = `${teacherId}${KEY_SEP}${period.subject}${KEY_SEP}${timetableDoc.standard}${KEY_SEP}${timetableDoc.division}`;

//       // Clash check: Ensure no double-booking per slot
//       if (!teacherSchedule[teacherId]) teacherSchedule[teacherId] = new Set();
//       if (teacherSchedule[teacherId].has(slot)) {
//         errors.push(
//           `Clash detected: Teacher ${teacherId} double-booked on ${dayBlock.day} at ${period.time}`
//         );
//       } else {
//         teacherSchedule[teacherId].add(slot);
//       }

//       // Lecture count
//       lectureCounts[key] = (lectureCounts[key] || 0) + 1;
//     }
//   }

//   // --- Validate with SubjectAllocation (handle missing gracefully) ---
//   for (let key in lectureCounts) {
//     const parts = key.split(KEY_SEP);
//     if (parts.length !== 4) continue; // Skip malformed keys
//     const [teacherId, subject, std, div] = parts;

//     let allocation;
//     try {
//       // Find the subject allocation for this specific teacher/subject/std/div combination
//       allocation = await SubjectAllocation.findOne({
//         teacher: teacherId,
//         subjects: { $in: [subject] }, 
//         standards: std,
//         divisions: div,
//       });
//     } catch (dbErr) {
//       console.error("DB query error in validation:", dbErr);
//       errors.push("Database error during allocation check");
//       continue;
//     }

//     if (!allocation) {
//       errors.push(
//         `Invalid allocation: Teacher ${teacherId} not assigned to ${subject} for Std ${std}${div}`
//       );
//       continue;
//     }

//     const assignedCount = lectureCounts[key];
//     // Assuming 'weeklyLectures' field exists on the SubjectAllocation model
//     const requiredCount = allocation.weeklyLectures; 

//     if (assignedCount > requiredCount) {
//       errors.push(
//         `Exceeds limit: Teacher ${teacherId} has ${assignedCount} ${subject} lectures (max: ${requiredCount})`
//       );
//     }
//     // Optional: Warn on under-assignment but don't error
//     if (assignedCount < requiredCount) {
//       console.warn(`Under-assignment: Teacher ${teacherId} has only ${assignedCount} ${subject} lectures (required: ${requiredCount})`);
//     }
//   }

//   return errors;
// };

// /**
//  * Save timetable (with improved validation)
//  */
// exports.generateTimetable = async (req, res) => {
//   try {
//     const { standard, division, timetable, submittedby, classteacher, from, to } = req.body;

//     const newTT = new Timetable({
//       standard,
//       division,
//       timetable,
//       submittedby,
//       classteacher,
//       from,
//       to,
//     });

//     // Run validation before saving
//     const errors = await validateTT(newTT);

//     if (errors.length > 0) {
//       console.error("Validation errors:", errors);
//       return res.status(400).json({ valid: false, errors });
//     }

//     await newTT.save();
//     res.status(201).json({ valid: true, timetable: newTT });
//   } catch (err) {
//     console.error("Error saving timetable:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * Validate Timetable (Checks for clashes and allocation adherence)
//  */
// exports.validateTimetable = async (req, res) => {
//   try {
//     const { standard, division } = req.params;

//     // Find the latest timetable for validation
//     const timetable = await Timetable.findOne({ standard, division })
//       .sort({ updatedAt: -1 }) // Ensure we validate the latest version
//       .populate(
//         "timetable.periods.teacher",
//         "fullname designation"
//       );

//     if (!timetable) {
//       return res.status(404).json({ error: "Timetable not found for validation" });
//     }

//     const errors = await validateTT(timetable);

//     if (errors.length > 0) {
//       return res.status(400).json({ valid: false, errors, message: "Validation failed due to errors." });
//     }

//     res.json({ valid: true, message: "No clashes or allocation mismatches ✅" });
//   } catch (error) {
//     console.error("Error during validation:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


// /**
//  * Manual arrangement of a lecture
//  */
// exports.arrangeTimetable = async (req, res) => {
//   try {
//     const { id } = req.params; // timetable id
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

//     await timetable.save();
//     res.json({ message: "Timetable updated successfully ✅", timetable });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// /**
//  * GET ALL TIMETABLES (Returns a deduplicated list of the latest timetables)
//  */
// exports.getTimetable = async (req, res) => {
//     try {
//         // Fetch all timetables and sort them by the latest update time descending
//         const allTimetables = await Timetable.find().sort({ updatedAt: -1 }).lean();
        
//         // Use a Map to store only the latest document for each unique standard/division
//         const uniqueTimetablesMap = new Map();
        
//         allTimetables.forEach(item => {
//             // Key to uniquely identify a class timetable
//             const key = `${item.standard}-${item.division}`; 

//             // Since we sorted by updatedAt DESC, the first one encountered for a key is the latest.
//             // We only need to check if the key is already present.
//             if (!uniqueTimetablesMap.has(key)) {
//                 uniqueTimetablesMap.set(key, item);
//             }
//         });

//         const uniqueTimetableList = Array.from(uniqueTimetablesMap.values());
        
//         // CRITICAL FIX: Always return 200 OK for a list endpoint, even if empty.
//         // This helps prevent unexpected server redirects that cause CORS preflight failures.
//         return res.status(200).json(uniqueTimetableList);

//     } catch (error) {
//         console.error("Error fetching all timetables:", error);
//         return res.status(500).json({ 
//             message: "Internal Server Error during timetable fetch.", 
//             error: error.message 
//         });
//     }
// };

const Timetable = require("../models/timetableModel");
const SubjectAllocation = require("../models/subjectAllocation");

// --- UTILITY: Calculate total working days (excluding Sundays & Holidays) ---
const getWorkingDays = (fromDate, toDate, holidays = []) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    let count = 0;
    
    // Convert holiday strings to Date objects for comparison, if necessary
    // For simplicity, we'll assume fromDate and toDate are "YYYY-MM-DD" and use string comparison for holidays.
    const holidayStrings = holidays.map(h => new Date(h).toISOString().slice(0, 10));

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const dateString = d.toISOString().slice(0, 10);
        
        // Exclude Sundays (dayOfWeek === 0)
        // Note: The frontend only supports Mon-Fri, so Saturday (6) is usually excluded too, 
        // but for date range calculation, we only explicitly exclude Sundays and defined holidays.
        if (dayOfWeek !== 0 && !holidayStrings.includes(dateString)) {
            count++;
        }
    }
    return count;
};

// The weekdays array used in the frontend (Monday to Friday)
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timingMap = {
    "07:00 - 13:00": {
        startHour: 7,
        totalPeriods: 10, // 6 hours (360 mins). 10 lectures * 30 min + 9 small breaks * 5 min + 1 long break * 30 min = 300 + 45 + 30 = 375 mins (6 hrs 15 mins).
                          // To fit 7:00-13:00 (6 hours = 360 mins): 10 periods * 30min = 300 min. 9 small breaks * 5 min = 45 min. Total: 345 mins. Leaves 15 mins for long break.
                          // Total: 300 min lectures + 45 min small breaks + 15 min long break = 360 mins. 
        lecturesPerDay: 10,
        lectureDuration: 30, // mins
        breakDuration: 5, // mins
        longBreakAfterPeriod: 5, // After 5th period
        longBreakDuration: 15, // mins
        longBreakSubject: "Lunch Break"
    }
    // You can add more timing options here
};

/**
 * CORE LOGIC: Dynamic Timetable Generation
 * * @param {string} standard The standard (e.g., "3") for which the timetable is generated.
 * @param {string} timing The timing key (e.g., "07:00 - 13:00").
 * @param {string} fromDate Start date (YYYY-MM-DD).
 * @param {string} toDate End date (YYYY-MM-DD).
 * @param {object} allocationData Object containing all required allocations for the standard.
 * @returns {object} Timetable structure for all divisions of the standard.
 */
const generateDynamicTimetable = (standard, timing, fromDate, toDate, allocationData) => {
    const { lecturesPerDay, lectureDuration, breakDuration, longBreakAfterPeriod, longBreakDuration, longBreakSubject } = timingMap[timing];
    
    // Calculate lecture slots
    let currentTime = timingMap[timing].startHour * 60; // Start time in minutes from midnight

    const getTimeSlot = (mins) => {
        const hours = Math.floor(mins / 60) % 24;
        const minutes = mins % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const slots = [];
    let periodNumber = 1;
    for (let i = 0; i < lecturesPerDay; i++) {
        const startTime = getTimeSlot(currentTime);
        currentTime += lectureDuration;
        const endTime = getTimeSlot(currentTime);
        slots.push({ periodNumber, time: `${startTime}-${endTime}`, isBreak: false });
        periodNumber++;

        if (i === lecturesPerDay - 1) break; // No break after the last period

        if (i === longBreakAfterPeriod - 1) { // After 5th period
            const breakStartTime = endTime;
            currentTime += longBreakDuration;
            const breakEndTime = getTimeSlot(currentTime);
            // This is a break slot that doesn't correspond to a periodNumber.
            slots.push({ periodNumber: null, time: `${breakStartTime}-${breakEndTime}`, isBreak: true, subject: longBreakSubject }); 
        } else {
            currentTime += breakDuration;
        }
    }
    
    // Initialize required lectures and schedule trackers per division
    const divisions = Object.keys(allocationData);
    const timetableByDivision = {};
    const totalWorkingDays = 5; // Assuming Mon-Fri for the timetable structure
    const totalSlots = slots.length;

    const teacherDailySchedule = {}; // Key: teacherId_day, Value: Set of periodNumber (0 to totalSlots-1)
    const lectureAssignments = {}; // Key: teacherId_division_subject, Value: current assigned count

    divisions.forEach(div => {
        timetableByDivision[div] = {
            standard: standard,
            division: div,
            timetable: weekdays.map(day => ({
                day: day,
                periods: Array(totalSlots).fill(null)
            }))
        };
        
        // Initialize assignment trackers and total required lectures for the division
        allocationData[div].forEach(alloc => {
            const key = `${alloc.teacher.toString()}_${div}_${alloc.subjects[0]}`;
            lectureAssignments[key] = {
                required: alloc.weeklyLectures,
                current: 0,
                teacher: alloc.teacher,
                subject: alloc.subjects[0]
            };
        });
    });

    // Simple Round-Robin/Greedy Scheduling Logic
    // Iterating through days, divisions, and periods to assign lectures
    
    const allAssignments = Object.values(lectureAssignments);
    let totalLecturesToAssign = allAssignments.reduce((sum, item) => sum + item.required, 0);

    // Sort assignments to ensure those with higher required lectures are prioritized in the round-robin
    allAssignments.sort((a, b) => b.required - a.required);

    let assignmentIndex = 0;

    // Outer loop: Iterate through all working days
    for (let dayIndex = 0; dayIndex < totalWorkingDays; dayIndex++) {
        const dayName = weekdays[dayIndex];
        
        // Inner loop 1: Iterate through all divisions
        divisions.forEach(div => {
            const divisionTimetable = timetableByDivision[div].timetable.find(d => d.day === dayName);
            
            // Inner loop 2: Iterate through all time slots (lectures and breaks)
            slots.forEach((slot, slotIndex) => {
                if (slot.isBreak) {
                    divisionTimetable.periods[slotIndex] = {
                        periodNumber: slot.periodNumber,
                        subject: slot.subject,
                        teacher: null,
                        time: slot.time
                    };
                    return;
                }

                // Skip if already assigned in this slot (should not happen with this structure, but for safety)
                if (divisionTimetable.periods[slotIndex]) return;

                let assigned = false;
                let attempts = 0;
                
                // Round-robin selection of an assignment needing a lecture
                while (attempts < allAssignments.length && !assigned && totalLecturesToAssign > 0) {
                    const currentAssignment = allAssignments[assignmentIndex];
                    const assignmentKey = `${currentAssignment.teacher.toString()}_${div}_${currentAssignment.subject}`;
                    
                    const tracker = lectureAssignments[assignmentKey];

                    if (tracker && tracker.current < tracker.required) {
                        const teacherId = tracker.teacher.toString();
                        const teacherDayKey = `${teacherId}_${dayName}`;

                        // Initialize daily schedule set for the teacher if not present
                        if (!teacherDailySchedule[teacherDayKey]) {
                            teacherDailySchedule[teacherDayKey] = new Set();
                        }

                        // Check for clash: Is the teacher already teaching at this time slot?
                        // We use the slot index (0 to totalSlots-1) to represent the time in the day.
                        if (!teacherDailySchedule[teacherDayKey].has(slotIndex)) {
                            // Assign lecture
                            divisionTimetable.periods[slotIndex] = {
                                periodNumber: slot.periodNumber,
                                subject: tracker.subject,
                                teacher: tracker.teacher,
                                time: slot.time
                            };
                            
                            // Update trackers
                            teacherDailySchedule[teacherDayKey].add(slotIndex);
                            tracker.current++;
                            totalLecturesToAssign--;
                            assigned = true;
                        }
                    }
                    
                    // Move to the next assignment in the round-robin queue
                    assignmentIndex = (assignmentIndex + 1) % allAssignments.length;
                    attempts++;
                }

                if (!assigned) {
                    // Fill with a 'Free Period' or a placeholder if no one can teach
                    divisionTimetable.periods[slotIndex] = {
                        periodNumber: slot.periodNumber,
                        subject: "Free Period",
                        teacher: null,
                        time: slot.time
                    };
                }
            });
            
            // The periods array is currently sparse (nulls for non-breaks). Filter out nulls and finalize structure.
            divisionTimetable.periods = divisionTimetable.periods.filter(p => p !== null);
        });
    }

    return timetableByDivision;
};

/**
 * Save timetable (with improved validation)
 * This function will be replaced by generateAndSaveTimetable for the new logic, 
 * but kept for existing manual TT creation or other clients.
 */
// ... (The existing generateTimetable function remains) ...

/**
 * New Endpoint: Generate and Save Timetable for all divisions of a Standard
 * POST /api/timetables/generate-standard
 */
exports.generateAndSaveTimetable = async (req, res) => {
    try {
        const { standard, timing, from, to, submittedby, classteachers } = req.body;

        if (!standard || !timing || !from || !to || !submittedby || !classteachers) {
            return res.status(400).json({ message: "Missing required fields: standard, timing, from, to, submittedby, or classteachers." });
        }
        
        // 1. Fetch all relevant Subject Allocations for this standard
        const allocations = await SubjectAllocation.find({
            standards: { $in: [standard] } // Find all allocations relevant to this standard
        }).lean();

        if (allocations.length === 0) {
            return res.status(404).json({ message: `No subject allocations found for Standard ${standard}.` });
        }

        // Group allocations by division
        const allocationData = {};
        allocations.forEach(alloc => {
            // Since the schema saves standards/divisions as single-item arrays, we use the first element
            const div = alloc.divisions[0];
            if (!allocationData[div]) {
                allocationData[div] = [];
            }
            allocationData[div].push(alloc);
        });

        // 2. Generate the dynamic timetable for all divisions
        const generatedTimetables = generateDynamicTimetable(standard, timing, from, to, allocationData);
        
        // 3. Save each generated timetable to the database
        const savedTimetables = [];
        const year = new Date(from).getFullYear(); 
        const divisions = Object.keys(generatedTimetables);

        for (const div of divisions) {
            const tt = generatedTimetables[div];
            
            // Get the classteacher ID for this division
            const classteacherEntry = classteachers.find(ct => ct.division === div);
            
            if (!classteacherEntry || !classteacherEntry.teacherId) {
                 // Skip saving if no classteacher is found for the division
                 console.warn(`Skipping timetable save for Std ${standard}-${div}: No classteacher ID provided.`);
                 continue; 
            }

            const newTT = new Timetable({
                standard: tt.standard,
                division: tt.division,
                timetable: tt.timetable,
                submittedby: submittedby,
                classteacher: classteacherEntry.teacherId, // Assign classteacher ID
                year: year, 
                from: from,
                to: to,
            });

            // Re-run validation for safety (optional, as the generator aims to avoid clashes)
            const errors = await validateTT(newTT);

            if (errors.length > 0) {
                console.error(`Validation errors for Std ${standard}-${div}:`, errors);
                // Decide whether to return an error or save only valid ones. Returning 400 here.
                return res.status(400).json({ valid: false, errors, message: `Validation failed for Std ${standard}-${div}.` });
            }
            
            await newTT.save();
            savedTimetables.push(newTT);
        }

        res.status(201).json({ 
            valid: true, 
            message: "Timetables created successfully for all divisions.",
            timetables: savedTimetables
        });

    } catch (err) {
        console.error("Error generating and saving timetable:", err);
        res.status(500).json({ error: err.message || "Internal Server Error" });
    }
};

/**
 * New Endpoint: Delete Timetable
 * DELETE /api/timetables/:id
 */
exports.deleteTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTimetable = await Timetable.findByIdAndDelete(id);

        if (!deletedTimetable) {
            return res.status(404).json({ message: "Timetable not found." });
        }

        res.status(200).json({ message: "Timetable deleted successfully." });
    } catch (err) {
        console.error("Error deleting timetable:", err);
        res.status(500).json({ error: err.message || "Internal Server Error" });
    }
};

// Export the new functions
module.exports = {
    // ... existing exports
    generateTimetable, 
    validateTimetable,
    arrangeTimetable,
    getTimetable,
    // New exports
    generateAndSaveTimetable,
    deleteTimetable
};