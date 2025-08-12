const Fee = require("../models/feeModel");
const Category = require("../models/categoryModel")

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

exports.addCategory = async (req, res) =>
{
  try{
    const response = new Category(req.body);
    await response.save()
    return res.status(200).json({message:'added category successfully'})
  }
  catch(error)
  {
    return res.status(500).json({error: error.message})
  }
}

exports.getCategory = async (req, res) =>
{
  try
  {
    const response = await Category.find();
    return res.status(200).json(response);
  }
  catch(error)
  {
    return res.status(500).json({error: error.message})
  }
}