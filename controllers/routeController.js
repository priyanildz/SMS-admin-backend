const Route = require("../models/routeModel");

exports.addRoute = async (req, res) => {
  try {
    const response = new Route(req.body);
    await response.save();
    return res.status(200).json({ message: "route added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRoutes = async (req, res) =>
{
    try
    {
        const response = await Route.find();
        return res.status(200).json(response);
    }
    catch(error)
    {
        return res.status(500).json({error: error.message})
    }
}