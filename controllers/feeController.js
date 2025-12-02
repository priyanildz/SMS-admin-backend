// const Fee = require("../models/feeModel");
// const Category = require("../models/categoryModel");

// // add fees structure
// exports.addFee = async (req, res) => {
//   try {
//     const newFee = new Fee(req.body);
//     await newFee.save();
//     res.status(201).json({ message: "Fee structure created", data: newFee });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // get all fees structure
// exports.getFees = async (req, res) => {
//   try {
//     const allFees = await Fee.find().sort({ createdAt: -1 });
//     res.status(200).json(allFees);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.addCategory = async (req, res) => {
//   try {
//     const response = new Category(req.body);
//     await response.save();
//     return res.status(200).json({ message: "added category successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.getCategory = async (req, res) => {
//   try {
//     const response = await Category.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // ✅ Get combined fee totals for Primary (1-7) and Secondary (8-10)
// exports.getCombinedFees = async (req, res) => {
//   try {
//     const fees = await Fee.find();

//     let primaryTotal = 0;
//     let secondaryTotal = 0;

//     fees.forEach((fee) => {
//       const stdNum = parseInt(fee.standard); // convert "2nd" → 2, "10th" → 10
//       if (!isNaN(stdNum)) {
//         if (stdNum >= 1 && stdNum <= 7) {
//           primaryTotal += fee.total;
//         } else if (stdNum >= 8 && stdNum <= 10) {
//           secondaryTotal += fee.total;
//         }
//       }
//     });

//     res.json({
//       primary: { standards: "1-7", totalAmount: primaryTotal },
//       secondary: { standards: "8-10", totalAmount: secondaryTotal },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// // const filterFeeCollection = async (req, res) => {
// //   const { duration, fromDate, toDate, category, standard, division, mode } = req.body;

// //   try {
// //     // Logic to filter fee collection based on provided parameters
// //     const filteredFees = await FeeModel.find({
// //       duration: duration || { $exists: true },
// //       date: {
// //         $gte: fromDate || new Date(0),
// //         $lte: toDate || new Date()
// //       },
// //       category: category || { $exists: true },
// //       standard: standard || { $exists: true },
// //       division: division || { $exists: true },
// //       mode: mode || { $exists: true }
// //     });

// //     res.status(200).json({ success: true, data: filteredFees });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // module.exports = { filterFeeCollection };




const Fee = require("../models/feeModel");
const Category = require("../models/categoryModel");

// Unique identifier for the single category document
const CATEGORY_SINGLETON_IDENTIFIER = 'FEE_CATEGORIES_SINGLETON';

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

// FIX: Update Category function to save all categories as a single comma-separated string
exports.addCategory = async (req, res) => {
  try {
    const categoriesArray = req.body.categories;
    
    if (!categoriesArray || !Array.isArray(categoriesArray)) {
      // If the frontend sends data in the old way, handle it gracefully
      const response = new Category(req.body); 
      await response.save();
      return res.status(200).json({ message: "added category successfully (Legacy)" });
    }

    // Convert the array of category names into a single comma-separated string
    const categoriesString = categoriesArray.join(", ");

    // Find and update the single category document (Upsert: creates if not exists)
    const updatedCategory = await Category.findOneAndUpdate(
      { identifier: CATEGORY_SINGLETON_IDENTIFIER }, // Find the singleton document
      {
        title: categoriesString, // Save all categories as a single comma-separated string
        identifier: CATEGORY_SINGLETON_IDENTIFIER // Ensure identifier is set
      },
      {
        new: true,
        upsert: true, 
        setDefaultsOnInsert: true
      }
    );
    
    return res.status(200).json({ message: "Categories saved successfully", data: updatedCategory });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// FIX: Update Category function to fetch only the singleton document
exports.getCategory = async (req, res) => {
  try {
    const response = await Category.find({ identifier: CATEGORY_SINGLETON_IDENTIFIER });
    // This will return an array containing at most one document: [{ title: "Cat A, Cat B" }]
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
      // Logic to parse standard (e.g., "2nd" → 2)
      const stdMatch = fee.standard.match(/\d+/);
      const stdNum = stdMatch ? parseInt(stdMatch[0], 10) : NaN;
      
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