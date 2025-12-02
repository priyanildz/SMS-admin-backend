const Fee = require("../models/feeModel");
const Category = require("../models/categoryModel");

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

exports.addCategory = async (req, res) => {
  try {
    const response = new Category(req.body);
    await response.save();
    return res.status(200).json({ message: "added category successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const response = await Category.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ✅ Get combined fee totals for Primary (1-7) and Secondary (8-10)
exports.getCombinedFees = async (req, res) => {
  try {
    const fees = await Fee.find();

    let primaryTotal = 0;
    let secondaryTotal = 0;

    fees.forEach((fee) => {
      const stdNum = parseInt(fee.standard); // convert "2nd" → 2, "10th" → 10
      if (!isNaN(stdNum)) {
        if (stdNum >= 1 && stdNum <= 7) {
          primaryTotal += fee.total;
        } else if (stdNum >= 8 && stdNum <= 10) {
          secondaryTotal += fee.total;
        }
      }
    });

    res.json({
      primary: { standards: "1-7", totalAmount: primaryTotal },
      secondary: { standards: "8-10", totalAmount: secondaryTotal },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// const filterFeeCollection = async (req, res) => {
//   const { duration, fromDate, toDate, category, standard, division, mode } = req.body;

//   try {
//     // Logic to filter fee collection based on provided parameters
//     const filteredFees = await FeeModel.find({
//       duration: duration || { $exists: true },
//       date: {
//         $gte: fromDate || new Date(0),
//         $lte: toDate || new Date()
//       },
//       category: category || { $exists: true },
//       standard: standard || { $exists: true },
//       division: division || { $exists: true },
//       mode: mode || { $exists: true }
//     });

//     res.status(200).json({ success: true, data: filteredFees });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = { filterFeeCollection };