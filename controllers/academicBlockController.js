const block = require("../models/blockModel");
exports.addBlock = async (req, res) => {
  try {
    const response = new block(req.body);
    await response.save();
    return res.status(200).json({ message: "block added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getBlocks = async (req, res) => {
  try {
    const response = await block.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
