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

// exports.addCategory = async (req, res) => {
//   try {
//     const response = new Category(req.body);
//     await response.save();
//     return res.status(200).json({ message: "added category successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

exports.addCategory = async (req, res) => {
  try {
    // 1. Extract the array of categories from the request body.
    const { categories } = req.body; 
    
    if (!Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({ error: "No categories provided." });
    }

    // 2. Join the array into a comma-separated string as expected by the logic 
    //    that parses the fetched categories in the frontend.
    const categoriesString = categories.join(", ");

    // 3. Create and save the new Category document with the 'title' field.
    // NOTE: This approach overwrites previous categories, which seems to be the intended behavior
    // based on the single-document parsing logic in fetchCategories.
    
    // Attempt to find an existing category document to update (recommended for configuration-like data)
    let existingCategory = await Category.findOne({});

    if (existingCategory) {
        existingCategory.title = categoriesString;
        await existingCategory.save();
    } else {
        // If no document exists, create a new one
        existingCategory = new Category({ title: categoriesString });
        await existingCategory.save();
    }

    return res.status(200).json({ message: "added category successfully" });
  } catch (error) {
    console.error("Category save error:", error);
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