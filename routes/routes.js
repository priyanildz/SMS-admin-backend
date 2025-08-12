const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const adminController = require("../controllers/adminController");
const staffController = require("../controllers/staffController");
const eventController = require("../controllers/eventController");
const announcementController = require("../controllers/announcementController");
const transportController = require("../controllers/transportController");
const examController = require("../controllers/examController");
const testController = require("../controllers/testController");
const classroomController = require("../controllers/classroomController");
const assessmentController = require("../controllers/assessmentController");
const subjectController = require("../controllers/subjectController");
const feeController = require("../controllers/feeController");

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
module.exports = router;