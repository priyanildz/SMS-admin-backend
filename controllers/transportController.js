const vehicleModel = require("../models/vehicleModel");
exports.addVehicle = async (req, res) => {
  try {
    const vehicle = new vehicleModel(req.body);
    await vehicle.save()
    return res.status(200).json({ message: "added vehicle successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getVehicle = async(req, res) =>
{
    try
    {
        const response = await vehicleModel.find();
        return res.status(200).json(response);
    }
    catch(error)
    {
        return res.status(500).json({ error: error.message });
    }
}