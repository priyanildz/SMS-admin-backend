const eblock = require("../models/eblockModel");
exports.addeblock = async (req, res) => {
  try {
    const response = new eblock(req.body);
    await response.save();
    return res.status(200).json({ message: "added eblock card" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.geteblock = async (req, res) => {
  try {
    const response = await eblock.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
