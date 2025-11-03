const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const adminController = require("../controllers/adminController");
const staffController = require("../controllers/staffController");
const eventController = require("../controllers/eventController");
const announcementController = require("../controllers/announcementController");
const transportController = require("../controllers/transportController");
const examController = require("../controllers/examController");
const paymentController = require("../controllers/paymentController");
const testController = require("../controllers/testController");
const classroomController = require("../controllers/classroomController");
const assessmentController = require("../controllers/assessmentController");
const subjectController = require("../controllers/subjectController");
const feeController = require("../controllers/feeController");
const syllabusTrackerController = require("../controllers/syllabusTrackerController");
const routeController = require("../controllers/routeController");
const subjectManagement = require("../controllers/subjectManagement");
const roleController = require("../controllers/roleController");
const questionPaperController = require("../controllers/questionPaperController");
const proxyController = require("../controllers/proxyController");
const timetableController = require("../controllers/timetableController");
const blockController = require("../controllers/academicBlockController");
const capacityController = require("../controllers/capacityController");
const paperEvaluationController = require("../controllers/paperEvaluationController");
const supervisiorController = require("../controllers/supervisorController");
const reportController = require("../controllers/reportController");
const eblockController = require("../controllers/eblockController");
const recheckingController = require("../controllers/recheckingController")
const vehicleSupController = require("../controllers/vehicleSupervisorController");

router.post("/assign-recheck", recheckingController.addRechecking);
router.get("/recheck", recheckingController.getRechecking);
router.post("/add-vsupervisior", vehicleSupController.registerStaff);
router.get("/vsupervisior", vehicleSupController.getAllStaff);
router.get(
  "/:standard/:division/validate",
  timetableController.validateTimetable
);
router.get("/timetables", timetableController.getTimetable);

router.post("/timetables/generate", timetableController.generateTimetable);
router.put("/:id/arrange", timetableController.arrangeTimetable);
// proxy endpoints
router.post("/add-proxy", proxyController.createProxy);
router.get("/proxies", proxyController.getProxies);

//edit student
router.put("/edit-student/:id", studentController.editStudent);

// login endpoint
router.post("/loginadmin", adminController.Login);

//signup endpoint not in ui
router.post("/registeradmin", adminController.Register);

// adding student api
router.post("/addstudent", studentController.createUser);

// displaying students api
router.get("/students", studentController.getStudents);

// displaying staff api
router.get("/staff", staffController.getStaff);

// adding staff endpoint
router.post("/addstaff", staffController.addStaff);

// displaying new students
router.get("/newstudent", studentController.getNewStudents);

// adding leave request of staff
router.post("/addleave", staffController.addLeave);

// get all applied requests
router.get("/getrequests", staffController.getRequests);

// adding an event
router.post("/addevent", eventController.addEvent);

// displaying all events
router.get("/events", eventController.getEvents);

// updating leave request by accept/reject
router.put("/update-req/:id", staffController.updateRequest);

// adding LC students
router.post("/lcstudent/:studentid", studentController.addLcStudents);

// get all LC students
router.get("/lcstudent", studentController.getLCStudents);

// add an announcement
router.post("/add-announcement", announcementController.addAnnouncement);

// display all announcements
router.get("/get-announcement", announcementController.getAnnouncement);

// add a vehicle
router.post("/add-vehicle", transportController.addVehicle);

// display all registered vehicles
router.get("/vehicles", transportController.getVehicle);

// add a driver
router.post("/add-driver", transportController.addDriver);

// display all drivers connected with vid of vehicle
router.get("/drivers", transportController.getDrivers);

// creating exam timetable
router.post("/add-etimetable", examController.addETimetable);

// display all exam schedules
router.get("/etimetable", examController.getETimetable);

// add term results
router.post("/add-test", testController.addTermResult);

// get all term results
router.get("/term-results", testController.getTermResults);

// get term result by id
router.get("/term-result/:id", testController.getResultsById);

// add classroom
router.post("/add-classroom", classroomController.addClassroom);

// modify announcement
router.put(
  "/modify-announcement/:id",
  announcementController.updateAnnouncement
);

// get students based on std & div
router.post("/student", studentController.getStudentByStd);

// add assessment in classroom module
router.post("/add-assessment", assessmentController.addAssessment);

// get all assessments
router.get("/assessment", assessmentController.getAssessment);

// get new staff's list
router.post("/newstaffs", staffController.getNewStaffsDetailed);

// edit an assessment
router.put("/edit-assessment/:_id", assessmentController.editAssessment);

// add subject allotment
router.post("/allot-subject", subjectController.addSubjectAllot);

// get all allotments
router.get("/allotments", subjectController.getAllocations);

// post req for fees structure
router.post("/add-fee", feeController.addFee);

// get req to list all structures
router.get("/fees", feeController.getFees);

// add category
router.post("/add-category", feeController.addCategory);

// get all categories
router.get("/categories", feeController.getCategory);

//students attendence
router.post("/studentAttendence", studentController.addAttendence);

//get Syllabus Tracker data
router.get("/getCurrentSyllabus", syllabusTrackerController.getCurrentSyllabus);

//add Syllabus Tracker data
router.post("/addSyllabus", syllabusTrackerController.addSyllabus);

// add route
router.post("/add-route", routeController.addRoute);

// get routes
router.get("/routes", routeController.getRoutes);

// add student assigning to route
router.post("/add-student-route", routeController.assignStudent);

// get students list
router.get("/students-route", routeController.getAssignedStudents);

//get student by ID
router.post("/student-by-id", studentController.getStudentById);

// add subjects
router.post("/add-subject", subjectManagement.addSubject);

router.get("/subjects", subjectManagement.getAllSubjects);

// get subjects by standard
router.get("/subjects/:standard", subjectManagement.getSubjectsByStandard);

// edit staff
router.put("/edit-staff/:id", staffController.editStaff);

// staff by id
router.get("/staff/:id", staffController.getStaffById);

router.post("/assign-role", roleController.assignRole);

router.get("/roles", roleController.getRoles);

router.post("/attendance", studentController.getAttendance);

router.get("/all-attendance", studentController.getAllAttendance);
// router.js (You need to add this to your main router file)
router.get("/staff/:staffid/subjects", staffController.getStaffSubjects);

router.get("/combined-fees", feeController.getCombinedFees);

router.get("/payment-entries", paymentController.getPaymentEntries);

router.post("/add-payment-entry", paymentController.addPaymentEntry);

// update payment entry with new installment
router.put("/update-payment-entry/:id", paymentController.updatePaymentEntry);

// filter transactions
router.get("/filter-transactions", paymentController.filterTransactions);

router.get("/dashboard-metrics", paymentController.getMetrices);

router.get("/sets/:standard/:subject", questionPaperController.getSets);

router.post("/add-set", questionPaperController.createSets);

router.post("/schedule", questionPaperController.addSchedule);

router.put("/update-vehicle/:id", transportController.updateVehicle);

router.get("/academic-blocks", blockController.getBlocks);

router.post("/add-academicblock", blockController.addBlock);

router.post("/add-capacity", capacityController.addCapacity);

router.get("/capacity", capacityController.getCapacity);

router.post("/assign-paper", paperEvaluationController.addEval);

router.get("/assigned-papers", paperEvaluationController.getEval);

router.post("/add-supervisor", supervisiorController.addSupervisor);

router.get("/get-supervisor", supervisiorController.getSupervisor);

router.post("/add-report", reportController.addReport);

router.get("/reports", reportController.getReport);

router.post("/assign-eblock", eblockController.addeblock);

router.get("/eblock", eblockController.geteblock);

// ADD STAFF ATTENDANCE (New Route)
router.post("/add-attendance", staffController.addAttendance);

// Example in your staffRoutes.js or equivalent file:
router.get("/staff/:staffid/attendance", staffController.getStaffAttendance);

// UPDATE STAFF ATTENDANCE (New Route)
router.put("/update-attendance", staffController.updateAttendance);

// Add the route for fetching staff-specific timetable data
router.get("/staff/:staffid/timetable", staffController.getStaffTimetable);

module.exports = router;
