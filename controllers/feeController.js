const Fee = require("../models/feeModel");

// add fees structure
exports.addFee = async (req, res) => {
  try {
    const newFee = new Fee(req.body);
    await newFee.save();
    res.status(201).json({ message: "Fee structure created", data: newFee });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get all fees structure
exports.getFees = async (req, res) => {
  try {
    const allFees = await Fee.find().sort({ createdAt: -1 });
    res.status(200).json(allFees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

