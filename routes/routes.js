const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const adminController = require("../controllers/adminController");
const staffController = require("../controllers/staffController");
const eventController = require("../controllers/eventController");
const announcementController = require("../controllers/announcementController");
const transportController = require('../controllers/transportController')
router.post("/loginadmin", adminController.Login);
router.post("/registeradmin", adminController.Register);
router.post("/addstudent", studentController.createUser);
router.get("/students", studentController.getStudents);
router.get("/staff", staffController.getStaff);
router.post("/addstaff", staffController.addStaff);
router.get("/newstudent", studentController.getNewStudents);
router.post("/addleave", staffController.addLeave);
router.get("/getrequests", staffController.getRequests);
router.post("/addevent", eventController.addEvent);
router.get("/events", eventController.getEvents);
router.put("/update-req/:id", staffController.updateRequest);
router.post("/lcstudent/:studentid", studentController.addLcStudents);
router.get("/lcstudent", studentController.getLCStudents);
router.post("/add-announcement", announcementController.addAnnouncement);
router.get("/get-announcement",announcementController.getAnnouncement);
router.post('/add-vehicle',transportController.addVehicle);
router.get('/vehicles',transportController.getVehicle)
module.exports = router;