const Route = require("../models/routeModel");
const vehicle = require("../models/vehicleModel");
const driver = require("../models/driverModel");
const studentAssign = require("../models/studentTransport");

exports.addRoute = async (req, res) => {
  try {
    const response = new Route(req.body);
    await response.save();
    return res.status(200).json({ message: "route added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    const vehicles = await vehicle.find();
    const drivers = await driver.find();

    const merged = routes.map((route) => {
      const vehicleInfo = vehicles.find(
        (v) => v.vehicleno === route.vehicleNumber
      );
      const driverInfo = drivers.find((v) => v.vid === vehicleInfo.vid);
      return {
        ...route.toObject(),
        vehicle: vehicleInfo || null,
        driverr: driverInfo || null,
      };
    });

    return res.status(200).json(merged);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.assignStudent = async (req, res) => {
  try {
    const response = new studentAssign(req.body);
    await response.save();
    return res
      .status(200)
      .json({ message: "student assigned to route successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAssignedStudents = async (req, res) => {
  try {
    const response = await studentAssign.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};