const Staff = require("../models/staffModel");
const staffAddress = require("../models/staffAddressModel");
const staffEductaion = require("../models/staffEducationModel");
const staffExperience = require("../models/staffExperienceModel");
const staffRole = require("../models/staffRole");
const staffBank = require("../models/staffBank");
const staffTransport = require("..//models/staffTransport");
const staffDocs = require("../models/staffDocument");
const staffLeave = require("../models/staffLeave");
const ResignedStaff = require("../models/resignedStaffModel");
const StaffAttendance = require("../models/staffAttendanceModel");

// Helper function to create/update sub-documents using upsert
const upsertStaffSubDoc = async (Model, staffid, data, fieldsToUpdate) => {
    // Extract only the fields relevant to the current Model from the main data object
    const updateData = fieldsToUpdate.reduce((acc, field) => {
        if (data[field] !== undefined) {
            acc[field] = data[field];
        }
        return acc;
    }, {});

    return Model.findOneAndUpdate(
        { staffid: staffid }, // Query: Find document by staffid
        { $set: updateData }, // Update: Set the fields
        { 
            new: true, 
            upsert: true, // IMPORTANT: Create if not found
            runValidators: true 
        }
    );
};

// =========================================================================
// ADD STAFF (Refactored)
// =========================================================================
exports.addStaff = async (req, res) => {
    try {
        const data = req.body;
        
        // --- 1. Save or Update the main Staff Document ---
        const staff = new Staff({
            staffid: data.staffid,
            firstname: data.firstname,
            middlename: data.middlename,
            lastname: data.lastname,
            dob: data.dob,
            maritalstatus: data.maritalstatus,
            bloodgroup: data.bloodgroup,
            gender: data.gender,
            category: data.category,
            nationality: data.nationality,
            aadharno: data.aadharno,
            photo: data.photo,
            status: data.status, 
            phoneno: data.phoneno,
            alternatephoneno: data.alternatephoneno,
            password: data.password, 
            emailaddress: data.emailaddress,
        });
        await staff.save();
        
        const staffId = data.staffid;

        // --- 2. Create Sub-Documents using the new upsert helper ---
        
        // Address
        await upsertStaffSubDoc(staffAddress, staffId, data, [
            "addressline1", "addressline2", "city", "postalcode", 
            "district", "state", "country"
        ]);

        // Education
        await upsertStaffSubDoc(staffEductaion, staffId, data, [
            "highestqualification", "yearofpassing", "specialization", 
            "certificates", "universityname"
        ]);

        // Experience
        await upsertStaffSubDoc(staffExperience, staffId, data, [
            "totalexperience", "designation", "previousemployer", 
            "subjectstaught", "reasonforleaving"
        ]);

        // Role
        await upsertStaffSubDoc(staffRole, staffId, data, [
            "position", "dept", "preferredgrades", "joiningdate"
        ]);

        // Bank
        await upsertStaffSubDoc(staffBank, staffId, data, [
            "bankname", "branchname", "accno", "ifccode", "panno"
        ]);

        // Transport
        await upsertStaffSubDoc(staffTransport, staffId, data, [
            "transportstatus", "pickuppoint", "droppoint", "modetransport"
        ]);

        // Documents
        await upsertStaffSubDoc(staffDocs, staffId, data, [
            "documentsurl"
        ]);

        return res.status(201).json({ message: "Staff added successfully" });
    } catch (error) {
        console.error("Error adding staff:", error);
        if (error.code === 11000) {
            return res.status(409).json({ error: "Duplicate key error. Staff ID or Aadhar already exists." });
        }
        return res.status(500).json({ error: error.message, message: "Internal Server Error during staff addition." });
    }
};

// =========================================================================
// EDIT STAFF (Refactored & Fixed for Partial Update)
// =========================================================================
exports.editStaff = async (req, res) => {
  try {
    const { id } = req.params; 
    const data = req.body;

    const updatedStaff = await Staff.findOneAndUpdate(
      { staffid: id },
      { ...data },
      { new: true, runValidators: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const staffId = updatedStaff.staffid;

    await Promise.all([
      upsertStaffSubDoc(staffAddress, staffId, data, ["addressline1", "addressline2", "city", "postalcode", "district", "state", "country"]),
      upsertStaffSubDoc(staffEductaion, staffId, data, ["highestqualification", "yearofpassing", "specialization", "certificates", "universityname"]),
      upsertStaffSubDoc(staffExperience, staffId, data, ["totalexperience", "designation", "previousemployer", "subjectstaught", "reasonforleaving"]),
      upsertStaffSubDoc(staffRole, staffId, data, ["position", "dept", "preferredgrades", "joiningdate"]),
      upsertStaffSubDoc(staffBank, staffId, data, ["bankname", "branchname", "accno", "ifccode", "panno"]),
      upsertStaffSubDoc(staffTransport, staffId, data, ["transportstatus", "pickuppoint", "droppoint", "modetransport"]),
      upsertStaffSubDoc(staffDocs, staffId, data, ["documentsurl"]),
    ]);

    return res.status(200).json({ message: "Staff updated successfully", data: updatedStaff });
  } catch (error) {
    console.error("Error updating staff:", error);
    return res.status(500).json({ error: error.message });
  }
};


// =========================================================================
// ADD STAFF ATTENDANCE
// =========================================================================
exports.addAttendance = async (req, res) => {
    try {
        const { staffid, date, status, checkInTime, checkOutTime } = req.body;

        if (!staffid || !date || !status) {
            return res.status(400).json({ message: "Staff ID, Date, and Status are required." });
        }

        // 1. Normalize the date to midnight local time, which MongoDB stores as UTC
        const normalizedDate = new Date(new Date(date).setHours(0, 0, 0, 0));

        // 2. Attempt to create a NEW document.
        const attendanceRecord = await StaffAttendance.create({
            staffid,
            date: normalizedDate,
            status,
            checkInTime,
            checkOutTime
        });

        return res.status(201).json({
            message: "Attendance recorded successfully",
            data: attendanceRecord
        });

    } catch (error) {
        console.error("Error adding staff attendance:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                error: "Duplicate Entry",
                message: `Attendance already recorded for staff ID ${req.body.staffid} on ${req.body.date}. Use an update endpoint to modify the record.`
            });
        }

        return res.status(500).json({ error: error.message, message: "Internal Server Error during attendance recording." });
    }
};

// =========================================================================
// UPDATE STAFF ATTENDANCE
// =========================================================================
exports.updateAttendance = async (req, res) => {
    try {
        const { staffid, date, status, checkInTime, checkOutTime } = req.body;
        
        if (!staffid || !date) {
            return res.status(400).json({ message: "Staff ID and Date are required for updating." });
        }
        
        // Normalize the date to match the stored format (midnight UTC)
        const normalizedDate = new Date(new Date(date).setHours(0, 0, 0, 0));

        const updatedRecord = await StaffAttendance.findOneAndUpdate(
            { staffid: staffid, date: normalizedDate }, 
            { 
                $set: { 
                    status: status, 
                    checkInTime: checkInTime, 
                    checkOutTime: checkOutTime 
                } 
            },
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!updatedRecord) {
            return res.status(404).json({ message: "Attendance record not found for this staff member on this date." });
        }

        return res.status(200).json({ 
            message: "Attendance updated successfully", 
            data: updatedRecord 
        });

    } catch (error) {
        console.error("Error updating staff attendance:", error);
        return res.status(500).json({ error: error.message, message: "Internal Server Error during attendance update." });
    }
};

// =========================================================================
// GET STAFF ATTENDANCE (Final attempt at normalization)
// =========================================================================
exports.getStaffAttendance = async (req, res) => {
    try {
        const { staffid } = req.params; 
        const { month, year } = req.query; 

        if (!staffid) {
            return res.status(400).json({ message: "Staff ID is required." });
        }

        const filter = { staffid: staffid };

        if (month && year) {
            let monthIndex; // 0 for Jan, 11 for Dec
            const yearInt = parseInt(year);

            if (isNaN(yearInt)) {
                 return res.status(400).json({ message: "Invalid year format provided." });
            }

            // Determine month index (0-11)
            if (!isNaN(month) && Number(month) >= 1 && Number(month) <= 12) {
                monthIndex = Number(month) - 1; 
            } else {
                const dateStr = `${month} 1, ${year}`;
                const parsedDate = Date.parse(dateStr);
                if (isNaN(parsedDate)) {
                    return res.status(400).json({ message: "Invalid month format provided." });
                }
                monthIndex = new Date(parsedDate).getMonth();
            }
            
            // --- CRITICAL FIX: Use local time constructor for query boundaries ---
            // We must align the query with the local time that the data was *saved* with.
            // Since `addAttendance` saves local midnight as a UTC timestamp, we query the same way.

            // Start of the month (YYYY-MM-01 00:00:00) in server's local timezone
            const startOfMonth = new Date(yearInt, monthIndex, 1);
            
            // Start of the next month (YYYY-MM+1-01 00:00:00) in server's local timezone
            const endOfMonth = new Date(yearInt, monthIndex + 1, 1);

            // Add date range filtering to the query
            filter.date = { 
                $gte: startOfMonth, 
                $lt: endOfMonth 
            };
            
            console.log(`Backend Query Filter (Range): staffid: ${staffid}, $gte: ${startOfMonth.toISOString()} / $lt: ${endOfMonth.toISOString()}`);
        } else {
            console.log("Backend Filter: Fetching all attendance records for the staff ID.");
        }
        
        // Fetch attendance records for the given staffid and date range (or all dates if no range set)
        const attendanceRecords = await StaffAttendance.find(filter).sort({ date: 1 });

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching staff attendance:", error);
        return res.status(500).json({ error: error.message, message: "Internal Server Error during attendance fetch." });
    }
};


// =========================================================================
// GET STAFF BY ID (Modified to fetch all related documents)
// =========================================================================
exports.getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findById(id);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        
        const staffId = staff.staffid;

        // Fetch all related documents concurrently
        const [
            address, 
            education, 
            experience, 
            role, 
            bank, 
            transport, 
            docs
        ] = await Promise.all([
            staffAddress.findOne({ staffid: staffId }),
            staffEductaion.findOne({ staffid: staffId }),
            staffExperience.findOne({ staffid: staffId }),
            staffRole.findOne({ staffid: staffId }),
            staffBank.findOne({ staffid: staffId }),
            staffTransport.findOne({ staffid: staffId }),
            staffDocs.findOne({ staffid: staffId }),
        ]);

        // Merge all documents into a single flat object for the frontend
        const mergedStaffData = {
            ...staff._doc,
            ...(address ? address._doc : {}),
            ...(education ? education._doc : {}),
            ...(experience ? experience._doc : {}),
            ...(role ? role._doc : {}),
            ...(bank ? bank._doc : {}),
            ...(transport ? transport._doc : {}),
            ...(docs ? docs._doc : {}),
            staffid: staffId 
        };
        
        delete mergedStaffData._id;
        delete mergedStaffData.__v;

        return res.status(200).json(mergedStaffData);
    } catch (error) {
        console.error("Error fetching staff by ID:", error);
        return res.status(500).json({ error: error.message });
    }
};


// =========================================================================
// UNMODIFIED FUNCTIONS (Rest of the controller functions)
// =========================================================================

// list all staff
exports.getStaff = async (req, res) => {
    try {
        const staffList = await Staff.find();
        const roleList = await staffRole.find();
    
        const combined = staffList.map((staff) => {
            const role = roleList.find(
                (role) => role.staffid.toString() === staff.staffid.toString()
            );
            return {
                ...staff._doc,
                role: role || null,
            };
        });
    
        return res.status(200).json(combined);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// staffController.js (You need to add this to your staff controller file)
exports.getStaffSubjects = async (req, res) => {
    // 1. Get staffid from params
    const { staffid } = req.params;
    
    // 2. Look up the staff member's teaching blocks/roles
    // This is where you would query your AcademicBlock or StaffRole model
    // For now, we'll return mock data to confirm the route works
    
    const mockAssignments = [
        { subject: 'Mathematics', standard: 8, division: 'A' },
        { subject: 'Science', standard: 8, division: 'B' },
        // ... (data that matches the frontend table structure)
    ];

    // Assuming the staff role lookup is complex, let's just return a generic list for now
    return res.status(200).json(mockAssignments);
};

exports.getStaffTimetable = async (req, res) => {
    try {
        const { staffid } = req.params;
        
        if (!staffid) {
            return res.status(400).json({ message: "Staff ID is required." });
        }

        // --- REPLACE MOCK DATA WITH YOUR ACTUAL DATABASE QUERY ---
        // You would typically query a Timetable model filtered by staffid.
        
        const mockTimetable = [
            { time: "7:00 to 7:30", Mon: "Maths (8A)", Tue: "Free", Wed: "History (9C)", Thu: "English (7B)" },
            { time: "7:30 to 8:00", Mon: "Science (8B)", Tue: "Maths (9A)", Wed: "History (9C)", Thu: "Computer (7C)" },
            { time: "8:00 to 8:30", Mon: "Assembly", Tue: "Free", Wed: "Maths (8B)", Thu: "Hindi (7C)" },
            // Add more rows to complete the schedule...
        ];
        
        // Return the timetable data
        return res.status(200).json(mockTimetable);
    } catch (error) {
        console.error("Error fetching staff timetable:", error);
        return res.status(500).json({ error: error.message, message: "Internal Server Error during timetable fetch." });
    }
};
// add leave request for staff
exports.addLeave = async (req, res) => {
    try {
        const leave = new staffLeave(req.body);
        await leave.save();
    
        return res.status(200).json({ message: "request sent successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// get all leave requests
exports.getRequests = async (req, res) => {
    try {
        const requests = await staffLeave.find(); 
        const staffList = await Staff.find(
            {},
            "staffid firstname lastname dept position _id"
        );
    
        const staffMap = {};
        staffList.forEach((staff) => {
            if (staff.staffid) {
                staffMap[staff.staffid.toString()] = staff;
            }
        });
    
        const merged = requests.map((r) => {
            const staffInfo = staffMap[r.staffid] || {};
            return {
                _id: r._id,
                subject: r.subject,
                message: r.message,
                status: r.status,
                submitted_at: r.submitted_at,
                from: r.from,
                to: r.to,
                staffid: r.staffid,
                firstname: staffInfo.firstname || "",
                lastname: staffInfo.lastname || "",
                dept: staffInfo.dept || "",
                position: staffInfo.position || "",
            };
        });
    
        return res.status(200).json(merged);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// update request status
exports.updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = [
            "pending",
            "approved",
            "rejected",
            "Pending",
            "Approved",
            "Rejected",
        ];
        if (!validStatuses.includes(status)) {
            return res
                .status(400)
                .json({
                    error: "Invalid status. Must be one of: Pending, Approved, Rejected",
                });
        }
    
        console.log("requested id", id);
        console.log("status", status);
        const updatedRequest = await staffLeave.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        console.log("updated req", updatedRequest);
        if (!updatedRequest) {
            return res.status(404).json({ error: "staff request not found" });
        }
    
        return res.status(200).json({
            message: "staff request updated successfully",
            request: updatedRequest,
        });
    } catch (error) {
        console.error("Error updating event:", error);
        return res.status(500).json({ error: error.message });
    }
};

exports.getNewStaffsDetailed = async (req, res) => {
    try {
        const staffRoles = await staffRole.find({
            joiningdate: {
                $gte: new Date("2025-01-01"),
            },
        });
    
        const staffIds = staffRoles.map((role) => role.staffid);
    
        const detailedStaffs = await Staff.find({ staffid: { $in: staffIds } });
    
        return res.status(200).json(detailedStaffs);
    } catch (error) {
        console.error("Error fetching new detailed staffs:", error);
        return res.status(500).json({ message: "Error: " + error.message });
    }
};

// Example health check endpoint:
exports.getHealthStatus = (req, res) => {
    return res.status(200).json({ 
        message: "Server is RUNNING and REFRESHED at " + new Date().toLocaleTimeString(), 
        status: true 
    });
};

exports.addResignedStaff = async (req, res) => {
    try {
        const { staffid } = req.params;
    
        if (!staffid) {
            return res.status(400).send({ message: "Please provide staffid" });
        }
    
        const staff = await staffRole.findOne({ staffid });
    
        if (!staff) {
            return res.status(404).send({ message: "No staff found with this ID" });
        }
    
        const resignedStaff = new ResignedStaff({
            staffid,
            resignationDate: new Date(),
            reason: req.body.reason || "Not specified",
        });
    
        await resignedStaff.save();
    
        return res.status(200).send({ message: "Staff resignation recorded" });
    } catch (error) {
        console.log("Error occurred:", error);
        return res.status(500).send({ message: "Error: " + error });
    }
};