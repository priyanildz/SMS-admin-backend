// const Staff = require("../models/staffModel");
// const staffAddress = require("../models/staffAddressModel");
// const staffEductaion = require("../models/staffEducationModel");
// const staffExperience = require("../models/staffExperienceModel");
// const staffRole = require("../models/staffRole");
// const staffBank = require("../models/staffBank");
// const staffTransport = require("..//models/staffTransport");
// const staffDocs = require("../models/staffDocument");
// const staffLeave = require("../models/staffLeave");
// const ResignedStaff = require("../models/resignedStaffModel");
// const StaffAttendance = require("../models/staffAttendanceModel");

// // Helper function to create/update sub-documents using upsert
// const upsertStaffSubDoc = async (Model, staffid, data, fieldsToUpdate) => {
//     // Extract only the fields relevant to the current Model from the main data object
//     const updateData = fieldsToUpdate.reduce((acc, field) => {
//         if (data[field] !== undefined) {
//             acc[field] = data[field];
//         }
//         return acc;
//     }, {});

//     return Model.findOneAndUpdate(
//         { staffid: staffid }, // Query: Find document by staffid
//         { $set: updateData }, // Update: Set the fields
//         { 
//             new: true, 
//             upsert: true, // IMPORTANT: Create if not found
//             runValidators: true 
//         }
//     );
// };

// // =========================================================================
// // ADD STAFF (Refactored)
// // =========================================================================
// exports.addStaff = async (req, res) => {
//     try {
//         const data = req.body;
        
//         // --- 1. Save or Update the main Staff Document ---
//         const staff = new Staff({
//             staffid: data.staffid,
//             firstname: data.firstname,
//             middlename: data.middlename,
//             lastname: data.lastname,
//             dob: data.dob,
//             maritalstatus: data.maritalstatus,
//             bloodgroup: data.bloodgroup,
//             gender: data.gender,
//             category: data.category,
//             nationality: data.nationality,
//             aadharno: data.aadharno,
//             photo: data.photo,
//             status: data.status, 
//             phoneno: data.phoneno,
//             alternatephoneno: data.alternatephoneno,
//             password: data.password, 
//             emailaddress: data.emailaddress,
//         });
//         await staff.save();
        
//         const staffId = data.staffid;

//         // --- 2. Create Sub-Documents using the new upsert helper ---
        
//         // Address
//         await upsertStaffSubDoc(staffAddress, staffId, data, [
//             "addressline1", "addressline2", "city", "postalcode", 
//             "district", "state", "country"
//         ]);

//         // Education
//         await upsertStaffSubDoc(staffEductaion, staffId, data, [
//             "highestqualification", "yearofpassing", "specialization", 
//             "certificates", "universityname"
//         ]);

//         // Experience
//         await upsertStaffSubDoc(staffExperience, staffId, data, [
//             "totalexperience", "designation", "previousemployer", 
//             "subjectstaught", "reasonforleaving"
//         ]);

//         // Role
//         await upsertStaffSubDoc(staffRole, staffId, data, [
//             "position", "dept", "preferredgrades", "joiningdate"
//         ]);

//         // Bank
//         await upsertStaffSubDoc(staffBank, staffId, data, [
//             "bankname", "branchname", "accno", "ifccode", "panno"
//         ]);

//         // Transport
//         await upsertStaffSubDoc(staffTransport, staffId, data, [
//             "transportstatus", "pickuppoint", "droppoint", "modetransport"
//         ]);

//         // Documents
//         await upsertStaffSubDoc(staffDocs, staffId, data, [
//             "documentsurl"
//         ]);

//         return res.status(201).json({ message: "Staff added successfully" });
//     } catch (error) {
//         console.error("Error adding staff:", error);
//         if (error.code === 11000) {
//             return res.status(409).json({ error: "Duplicate key error. Staff ID or Aadhar already exists." });
//         }
//         return res.status(500).json({ error: error.message, message: "Internal Server Error during staff addition." });
//     }
// };

// // =========================================================================
// // EDIT STAFF (Refactored & Fixed for Partial Update)
// // =========================================================================
// exports.editStaff = async (req, res) => {
//   try {
//     const { id } = req.params; 
//     const data = req.body;

//     const updatedStaff = await Staff.findOneAndUpdate(
//       { staffid: id },
//       { ...data },
//       { new: true, runValidators: true }
//     );

//     if (!updatedStaff) {
//       return res.status(404).json({ message: "Staff not found" });
//     }

//     const staffId = updatedStaff.staffid;

//     await Promise.all([
//       upsertStaffSubDoc(staffAddress, staffId, data, ["addressline1", "addressline2", "city", "postalcode", "district", "state", "country"]),
//       upsertStaffSubDoc(staffEductaion, staffId, data, ["highestqualification", "yearofpassing", "specialization", "certificates", "universityname"]),
//       upsertStaffSubDoc(staffExperience, staffId, data, ["totalexperience", "designation", "previousemployer", "subjectstaught", "reasonforleaving"]),
//       upsertStaffSubDoc(staffRole, staffId, data, ["position", "dept", "preferredgrades", "joiningdate"]),
//       upsertStaffSubDoc(staffBank, staffId, data, ["bankname", "branchname", "accno", "ifccode", "panno"]),
//       upsertStaffSubDoc(staffTransport, staffId, data, ["transportstatus", "pickuppoint", "droppoint", "modetransport"]),
//       upsertStaffSubDoc(staffDocs, staffId, data, ["documentsurl"]),
//     ]);

//     return res.status(200).json({ message: "Staff updated successfully", data: updatedStaff });
//   } catch (error) {
//     console.error("Error updating staff:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };


// // =========================================================================
// // ADD STAFF ATTENDANCE
// // =========================================================================
// exports.addAttendance = async (req, res) => {
//     try {
//         const { staffid, date, status, checkInTime, checkOutTime } = req.body;

//         if (!staffid || !date || !status) {
//             return res.status(400).json({ message: "Staff ID, Date, and Status are required." });
//         }

//         // 1. Normalize the date to midnight local time, which MongoDB stores as UTC
//         const normalizedDate = new Date(new Date(date).setHours(0, 0, 0, 0));

//         // 2. Attempt to create a NEW document.
//         const attendanceRecord = await StaffAttendance.create({
//             staffid,
//             date: normalizedDate,
//             status,
//             checkInTime,
//             checkOutTime
//         });

//         return res.status(201).json({
//             message: "Attendance recorded successfully",
//             data: attendanceRecord
//         });

//     } catch (error) {
//         console.error("Error adding staff attendance:", error);

//         if (error.code === 11000) {
//             return res.status(409).json({
//                 error: "Duplicate Entry",
//                 message: `Attendance already recorded for staff ID ${req.body.staffid} on ${req.body.date}. Use an update endpoint to modify the record.`
//             });
//         }

//         return res.status(500).json({ error: error.message, message: "Internal Server Error during attendance recording." });
//     }
// };

// // =========================================================================
// // UPDATE STAFF ATTENDANCE
// // =========================================================================
// exports.updateAttendance = async (req, res) => {
//     try {
//         const { staffid, date, status, checkInTime, checkOutTime } = req.body;
        
//         if (!staffid || !date) {
//             return res.status(400).json({ message: "Staff ID and Date are required for updating." });
//         }
        
//         // Normalize the date to match the stored format (midnight UTC)
//         const normalizedDate = new Date(new Date(date).setHours(0, 0, 0, 0));

//         const updatedRecord = await StaffAttendance.findOneAndUpdate(
//             { staffid: staffid, date: normalizedDate }, 
//             { 
//                 $set: { 
//                     status: status, 
//                     checkInTime: checkInTime, 
//                     checkOutTime: checkOutTime 
//                 } 
//             },
//             { 
//                 new: true, 
//                 runValidators: true 
//             }
//         );

//         if (!updatedRecord) {
//             return res.status(404).json({ message: "Attendance record not found for this staff member on this date." });
//         }

//         return res.status(200).json({ 
//             message: "Attendance updated successfully", 
//             data: updatedRecord 
//         });

//     } catch (error) {
//         console.error("Error updating staff attendance:", error);
//         return res.status(500).json({ error: error.message, message: "Internal Server Error during attendance update." });
//     }
// };

// // =========================================================================
// // GET STAFF ATTENDANCE (Final attempt at normalization)
// // =========================================================================
// exports.getStaffAttendance = async (req, res) => {
//     try {
//         const { staffid } = req.params; 
//         const { month, year } = req.query; 

//         if (!staffid) {
//             return res.status(400).json({ message: "Staff ID is required." });
//         }

//         const filter = { staffid: staffid };

//         if (month && year) {
//             let monthIndex; // 0 for Jan, 11 for Dec
//             const yearInt = parseInt(year);

//             if (isNaN(yearInt)) {
//                  return res.status(400).json({ message: "Invalid year format provided." });
//             }

//             // Determine month index (0-11)
//             if (!isNaN(month) && Number(month) >= 1 && Number(month) <= 12) {
//                 monthIndex = Number(month) - 1; 
//             } else {
//                 const dateStr = `${month} 1, ${year}`;
//                 const parsedDate = Date.parse(dateStr);
//                 if (isNaN(parsedDate)) {
//                     return res.status(400).json({ message: "Invalid month format provided." });
//                 }
//                 monthIndex = new Date(parsedDate).getMonth();
//             }
            
//             // --- CRITICAL FIX: Use local time constructor for query boundaries ---
//             // We must align the query with the local time that the data was *saved* with.
//             // Since `addAttendance` saves local midnight as a UTC timestamp, we query the same way.

//             // Start of the month (YYYY-MM-01 00:00:00) in server's local timezone
//             const startOfMonth = new Date(yearInt, monthIndex, 1);
            
//             // Start of the next month (YYYY-MM+1-01 00:00:00) in server's local timezone
//             const endOfMonth = new Date(yearInt, monthIndex + 1, 1);

//             // Add date range filtering to the query
//             filter.date = { 
//                 $gte: startOfMonth, 
//                 $lt: endOfMonth 
//             };
            
//             console.log(`Backend Query Filter (Range): staffid: ${staffid}, $gte: ${startOfMonth.toISOString()} / $lt: ${endOfMonth.toISOString()}`);
//         } else {
//             console.log("Backend Filter: Fetching all attendance records for the staff ID.");
//         }
        
//         // Fetch attendance records for the given staffid and date range (or all dates if no range set)
//         const attendanceRecords = await StaffAttendance.find(filter).sort({ date: 1 });

//         if (!attendanceRecords || attendanceRecords.length === 0) {
//             return res.status(200).json([]);
//         }

//         return res.status(200).json(attendanceRecords);
//     } catch (error) {
//         console.error("Error fetching staff attendance:", error);
//         return res.status(500).json({ error: error.message, message: "Internal Server Error during attendance fetch." });
//     }
// };


// // =========================================================================
// // GET STAFF BY ID (Modified to fetch all related documents)
// // =========================================================================
// exports.getStaffById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const staff = await Staff.findById(id);
//         if (!staff) {
//             return res.status(404).json({ message: "Staff not found" });
//         }
        
//         const staffId = staff.staffid;

//         // Fetch all related documents concurrently
//         const [
//             address, 
//             education, 
//             experience, 
//             role, 
//             bank, 
//             transport, 
//             docs
//         ] = await Promise.all([
//             staffAddress.findOne({ staffid: staffId }),
//             staffEductaion.findOne({ staffid: staffId }),
//             staffExperience.findOne({ staffid: staffId }),
//             staffRole.findOne({ staffid: staffId }),
//             staffBank.findOne({ staffid: staffId }),
//             staffTransport.findOne({ staffid: staffId }),
//             staffDocs.findOne({ staffid: staffId }),
//         ]);

//         // Merge all documents into a single flat object for the frontend
//         const mergedStaffData = {
//             ...staff._doc,
//             ...(address ? address._doc : {}),
//             ...(education ? education._doc : {}),
//             ...(experience ? experience._doc : {}),
//             ...(role ? role._doc : {}),
//             ...(bank ? bank._doc : {}),
//             ...(transport ? transport._doc : {}),
//             ...(docs ? docs._doc : {}),
//             staffid: staffId 
//         };
        
//         delete mergedStaffData._id;
//         delete mergedStaffData.__v;

//         return res.status(200).json(mergedStaffData);
//     } catch (error) {
//         console.error("Error fetching staff by ID:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };


// // =========================================================================
// // UNMODIFIED FUNCTIONS (Rest of the controller functions)
// // =========================================================================

// // list all staff
// exports.getStaff = async (req, res) => {
//     try {
//         const staffList = await Staff.find();
//         const roleList = await staffRole.find();
    
//         const combined = staffList.map((staff) => {
//             const role = roleList.find(
//                 (role) => role.staffid.toString() === staff.staffid.toString()
//             );
//             return {
//                 ...staff._doc,
//                 role: role || null,
//             };
//         });
    
//         return res.status(200).json(combined);
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // staffController.js (You need to add this to your staff controller file)
// exports.getStaffSubjects = async (req, res) => {
//     // 1. Get staffid from params
//     const { staffid } = req.params;
    
//     // 2. Look up the staff member's teaching blocks/roles
//     // This is where you would query your AcademicBlock or StaffRole model
//     // For now, we'll return mock data to confirm the route works
    
//     const mockAssignments = [
//         { subject: 'Mathematics', standard: 8, division: 'A' },
//         { subject: 'Science', standard: 8, division: 'B' },
//         // ... (data that matches the frontend table structure)
//     ];

//     // Assuming the staff role lookup is complex, let's just return a generic list for now
//     return res.status(200).json(mockAssignments);
// };

// exports.getStaffTimetable = async (req, res) => {
//     try {
//         const { staffid } = req.params;
        
//         if (!staffid) {
//             return res.status(400).json({ message: "Staff ID is required." });
//         }

//         // --- REPLACE MOCK DATA WITH YOUR ACTUAL DATABASE QUERY ---
//         // You would typically query a Timetable model filtered by staffid.
        
//         const mockTimetable = [
//             { time: "7:00 to 7:30", Mon: "Maths (8A)", Tue: "Free", Wed: "History (9C)", Thu: "English (7B)" },
//             { time: "7:30 to 8:00", Mon: "Science (8B)", Tue: "Maths (9A)", Wed: "History (9C)", Thu: "Computer (7C)" },
//             { time: "8:00 to 8:30", Mon: "Assembly", Tue: "Free", Wed: "Maths (8B)", Thu: "Hindi (7C)" },
//             // Add more rows to complete the schedule...
//         ];
        
//         // Return the timetable data
//         return res.status(200).json(mockTimetable);
//     } catch (error) {
//         console.error("Error fetching staff timetable:", error);
//         return res.status(500).json({ error: error.message, message: "Internal Server Error during timetable fetch." });
//     }
// };
// // add leave request for staff
// exports.addLeave = async (req, res) => {
//     try {
//         const leave = new staffLeave(req.body);
//         await leave.save();
    
//         return res.status(200).json({ message: "request sent successfully" });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // get all leave requests
// exports.getRequests = async (req, res) => {
//     try {
//         const requests = await staffLeave.find(); 
//         const staffList = await Staff.find(
//             {},
//             "staffid firstname lastname dept position _id"
//         );
    
//         const staffMap = {};
//         staffList.forEach((staff) => {
//             if (staff.staffid) {
//                 staffMap[staff.staffid.toString()] = staff;
//             }
//         });
    
//         const merged = requests.map((r) => {
//             const staffInfo = staffMap[r.staffid] || {};
//             return {
//                 _id: r._id,
//                 subject: r.subject,
//                 message: r.message,
//                 status: r.status,
//                 submitted_at: r.submitted_at,
//                 from: r.from,
//                 to: r.to,
//                 staffid: r.staffid,
//                 firstname: staffInfo.firstname || "",
//                 lastname: staffInfo.lastname || "",
//                 dept: staffInfo.dept || "",
//                 position: staffInfo.position || "",
//             };
//         });
    
//         return res.status(200).json(merged);
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// // update request status
// exports.updateRequest = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;
//         const validStatuses = [
//             "pending",
//             "approved",
//             "rejected",
//             "Pending",
//             "Approved",
//             "Rejected",
//         ];
//         if (!validStatuses.includes(status)) {
//             return res
//                 .status(400)
//                 .json({
//                     error: "Invalid status. Must be one of: Pending, Approved, Rejected",
//                 });
//         }
    
//         console.log("requested id", id);
//         console.log("status", status);
//         const updatedRequest = await staffLeave.findByIdAndUpdate(
//             id,
//             { status },
//             { new: true }
//         );
//         console.log("updated req", updatedRequest);
//         if (!updatedRequest) {
//             return res.status(404).json({ error: "staff request not found" });
//         }
    
//         return res.status(200).json({
//             message: "staff request updated successfully",
//             request: updatedRequest,
//         });
//     } catch (error) {
//         console.error("Error updating event:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };

// exports.getNewStaffsDetailed = async (req, res) => {
//     try {
//         const staffRoles = await staffRole.find({
//             joiningdate: {
//                 $gte: new Date("2025-01-01"),
//             },
//         });
    
//         const staffIds = staffRoles.map((role) => role.staffid);
    
//         const detailedStaffs = await Staff.find({ staffid: { $in: staffIds } });
    
//         return res.status(200).json(detailedStaffs);
//     } catch (error) {
//         console.error("Error fetching new detailed staffs:", error);
//         return res.status(500).json({ message: "Error: " + error.message });
//     }
// };

// // Example health check endpoint:
// exports.getHealthStatus = (req, res) => {
//     return res.status(200).json({ 
//         message: "Server is RUNNING and REFRESHED at " + new Date().toLocaleTimeString(), 
//         status: true 
//     });
// };

// exports.addResignedStaff = async (req, res) => {
//     try {
//         const { staffid } = req.params;
    
//         if (!staffid) {
//             return res.status(400).send({ message: "Please provide staffid" });
//         }
    
//         const staff = await staffRole.findOne({ staffid });
    
//         if (!staff) {
//             return res.status(404).send({ message: "No staff found with this ID" });
//         }
    
//         const resignedStaff = new ResignedStaff({
//             staffid,
//             resignationDate: new Date(),
//             reason: req.body.reason || "Not specified",
//         });
    
//         await resignedStaff.save();
    
//         return res.status(200).send({ message: "Staff resignation recorded" });
//     } catch (error) {
//         console.log("Error occurred:", error);
//         return res.status(500).send({ message: "Error: " + error });
//     }
// };

// exports.getStaffHistory = async (req, res) => {
//     try {
//         const staffId = req.params.staffid;

//         // 1. Fetch history from the database using staffId
//         // This is where you would query your DB (e.g., Mongoose or raw SQL)
//         // const history = await StaffHistoryModel.find({ staffId: staffId }).sort({ date: 1 });

//         // Example Placeholder Data if you don't have a model yet
//         const history = [
//             { id: 1, label: "Joined as Primary Teacher", date: "2023-06-15T10:00:00Z" },
//             { id: 2, label: "Promoted to Senior Teacher", date: "2024-01-20T10:00:00Z" },
//         ];


//         if (history && history.length > 0) {
//             return res.status(200).json(history);
//         } else {
//             // Return an empty array or 204 if no history is found, 
//             // but not a 404 since the route itself is valid.
//             return res.status(200).json([]);
//         }
//     } catch (error) {
//         console.error("Error fetching staff history:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// };

import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import axios from "axios";
import { API_BASE_URL } from '../config'; 

const ExamQuestionPaper = () => {
  const [selectedStd, setSelectedStd] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sets, setSets] = useState([]);
  const [schedule, setSchedule] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);

  // State for Set Creation
  const [showCreateSetModal, setShowCreateSetModal] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  // CHANGED: Now holds the actual File object
  const [newSetFile, setNewSetFile] = useState(null); 

  // API Authentication Header
  const AUTH_HEADER = "ZjVGZPUtYW1hX2aanjoiZXJyb3IiOnRzZ3g="; // Simplified for display

  // --- Handlers ---

  // Function to fetch question paper sets
  const fetchSets = async (std, subject) => {
    if (!std || !subject) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}api/sets/${std}/${subject}`,
        {
          headers: {
            "Content-Type": "application/json",
            auth: AUTH_HEADER,
          },
        }
      );
      const sortedSets = (res.data || []).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      setSets(sortedSets);
    } catch (err) {
      console.error("Error fetching sets:", err);
      alert("Failed to fetch sets.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleStandardChange = async (e) => {
    const std = e.target.value;
    setSelectedStd(std);
    setSelectedSubject(""); 
    setSets([]);
    if (!std) return;

    try {
      const res = await axios.get(`${API_BASE_URL}api/subjects/${std}`, {
        headers: {
          "Content-Type": "application/json",
          auth: AUTH_HEADER,
        },
      });
      setSubjects(res.data.subjects[0]?.subjectname || []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    fetchSets(selectedStd, subject);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setNewSetFile(e.target.files[0] || null); // Save the file object
  };

  // Handle creation of a new set (MODIFIED to use FormData)
  const handleCreateSet = async () => {
    if (!newSetName || !newSetFile || !selectedStd || !selectedSubject) {
      alert("Please fill in the Set Name, select a PDF file, and choose a Standard/Subject.");
      return;
    }

    // 1. Prepare FormData for file upload
    const formData = new FormData();
    formData.append('name', newSetName);
    formData.append('standard', selectedStd);
    formData.append('subject', selectedSubject);
    formData.append('pdfFile', newSetFile); // Key matches Multer field name ('pdfFile')

    try {
      // 2. Send the file using FormData
      await axios.post(
        `${API_BASE_URL}api/add-set`,
        formData, // Sending FormData instead of JSON body
        {
          headers: {
            "Content-Type": "multipart/form-data", // CRITICAL for file upload
            auth: AUTH_HEADER,
          },
        }
      );
      alert("New Set created successfully! File uploaded to Cloudinary.");
      setShowCreateSetModal(false);
      setNewSetName("");
      setNewSetFile(null);
      // Refresh sets list
      fetchSets(selectedStd, selectedSubject); 
    } catch (err) {
      console.error("Error creating set:", err.response?.data?.error || err.message);
      alert(`Failed to create set: ${err.response?.data?.error || err.message}`);
    }
  };


  const handleSchedule = async (setPath) => { 
    if (!schedule) {
      alert("Please select date & time before scheduling");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}api/schedule`,
        {
          standard: selectedStd,
          subject: selectedSubject,
          set: setPath, 
          schedule,
        },
        {
          headers: {
            "Content-Type": "application/json",
            auth: AUTH_HEADER,
          },
        }
      );
      alert("Scheduled successfully!");
      setShowModal(false);
      setSchedule("");
      fetchSets(selectedStd, selectedSubject); 
    } catch (err) {
      console.error("Error scheduling:", err);
      alert(`Failed to schedule: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleViewPaper = (pdfPath) => {
    // This path is now expected to be the direct Cloudinary URL
    window.open(pdfPath, "_blank"); 
  };


  const openScheduleModal = (set) => {
    setSelectedSet(set);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSet(null);
    setSchedule("");
  };

  const getStandardOptions = () => {
    const options = [];
    for (let i = 1; i <= 10; i++) {
      options.push(<option key={i} value={String(i)}>{i}</option>);
    }
    return options;
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto mt-10">
        
        {/* Main Title */}
        <h3 className="text-center text-2xl font-bold text-blue-700 mb-8">
          Question Paper Management
        </h3>

        {/* Standard and Selected Subject Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          {/* Select Standard */}
          <div>
            <label className="block text-lg font-medium text-gray-800 mb-2">
              Std
            </label>
            <select
              value={selectedStd}
              onChange={handleStandardChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select</option>
              {getStandardOptions()} 
            </select>
          </div>

          {/* Selected Subject Display (Read-only for the Subject title) */}
          <div>
            <label className="block text-lg font-medium text-gray-800 mb-2">
              Subject:
            </label>
            <div className="border border-gray-300 rounded-md px-4 py-2 text-base bg-gray-100 h-[42px] flex items-center">
              {selectedSubject || 'N/A'}
            </div>
          </div>
        </div>

        {/* --- STEP 2: Subject Buttons (Only appears if Standard is selected) --- */}
        {selectedStd && (
          <div className="mb-10 p-4 border rounded-lg bg-blue-50">
            <h4 className="text-center text-lg font-medium text-blue-700 mb-6">
              Select Subject
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {subjects.length > 0 ? subjects.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => handleSubjectClick(sub)}
                  className={`py-2 px-4 rounded-lg shadow-md transition-colors duration-200 ${
                    selectedSubject === sub 
                      ? 'bg-blue-800 text-white font-semibold ring-2 ring-blue-500' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                >
                  {sub}
                </button>
              )) : <p className="col-span-4 text-center text-gray-500">No subjects found for this standard.</p>}
            </div>
          </div>
        )}


        {/* --- STEP 3: Available Sets Grid & Create Button (Only appears if Subject is selected) --- */}
        {selectedSubject && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-gray-800">
                Question Paper Sets
              </h4>
              <button
                onClick={() => {
                  setShowCreateSetModal(true);
                  setNewSetName(""); 
                  setNewSetFile(null); 
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                + Create New Set
              </button>
            </div>
            
            {/* Loading State */}
            {loading && <p className="text-center mt-6">Loading sets...</p>}

            {/* Dynamic Sets Display */}
            {!loading && sets.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-8">
                {sets.map((set, idx) => (
                  <div
                    key={idx}
                    className={`w-40 h-40 border rounded-lg flex flex-col items-center justify-center gap-2 font-semibold text-xl shadow-lg transition duration-300 p-4 ${
                      set.isScheduled 
                        ? 'bg-green-100 border-green-400 text-green-700' 
                        : 'bg-blue-50 border-blue-400 text-blue-700 hover:shadow-xl'
                    }`}
                  >
                    
                    <div className="text-center">
                      <h5 className="text-xl font-bold mb-1">{set.name}</h5>
                    </div>

                    {/* View Button: Opens the PDF file path (now a Cloudinary URL) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleViewPaper(set.pdfPath); 
                      }}
                      className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Paper
                    </button>

                    {/* Schedule Button/Status */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        !set.isScheduled && openScheduleModal(set);
                      }}
                      disabled={set.isScheduled}
                      className={`w-full text-sm py-1 px-2 rounded-md font-medium transition-colors ${
                        set.isScheduled
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {set.isScheduled ? "Scheduled" : "Schedule Exam"}
                    </button>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No question sets available for {selectedSubject}.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Schedule Modal */}
        {showModal && selectedSet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Schedule Exam</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Selected Set: {selectedSet.name}</h4>
                <p className="text-sm text-gray-500">Standard {selectedStd} • {selectedSubject}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date & Time</label>
                <input
                  type="datetime-local"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">Cancel</button>
                <button
                  onClick={() => handleSchedule(selectedSet.pdfPath)} 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Schedule Exam
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Create New Set Modal */}
        {showCreateSetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Create New Question Set
                </h3>
                <button
                  onClick={() => setShowCreateSetModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Name (e.g., Set A)
                </label>
                <input
                  type="text"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter set name"
                />
              </div>

              {/* File Upload Input (PDF File) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload PDF Question Paper
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {newSetFile && (
                  <p className="mt-2 text-sm text-gray-500">File selected: **{newSetFile.name}**</p>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowCreateSetModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSet}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Save Set
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default ExamQuestionPaper;