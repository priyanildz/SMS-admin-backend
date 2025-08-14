const vehicleModel = require("../models/vehicleModel");
const driverModel = require("../models/driverModel")
exports.addVehicle = async (req, res) => {
  try {
    const vehicle = new vehicleModel(req.body);
    await vehicle.save()
    return res.status(200).json({ message: "added vehicle successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getVehicle = async (req, res) => {
  try {
    const response = await vehicleModel.find();
    return res.status(200).json(response);
  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
exports.addDriver = async (req, res) => {
  try {
    const driver = new driverModel(req.body);
    await driver.save()
    return res.status(200).json({ message: 'driver added successfully' })
  }
  catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await driverModel.find();
    const vehicles = await vehicleModel.find();

    const merged = drivers.map(driver => {
      const vehicle = vehicles.find(v => 
        v.vid?.toString() === driver.vid?.toString()
      );

      return {
        ...driver.toObject(),
        vehicles: vehicle || {} // agar vehicle na mile to empty object
      };
    });

    return res.status(200).json(merged);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
