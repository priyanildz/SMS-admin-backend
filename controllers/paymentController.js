// const paymentEntry = require("../models/paymentEntry");
// const PaymentEntry = require("../models/paymentEntry");

// exports.getPaymentEntries = async (req, res) => {
//   try {
//     const { std, div, search } = req.query;
//     let query = {};

//     if (std) query.std = std;
//     if (div) query.div = div;
//     if (search) query.name = { $regex: search, $options: "i" };

//     const paymentEntries = await PaymentEntry.find(query);
//     res.status(200).json(paymentEntries);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.addPaymentEntry = async (req, res) => {
//   const { name, std, div, date, installmentType, amount, mode } = req.body;

//   try {
//     const newEntry = new PaymentEntry({
//       name,
//       std,
//       div,
//       totalFees: amount,
//       status: "Unpaid",
//       installments: [{ date, amount }],
//     });
//     const savedEntry = await newEntry.save();
//     res.status(201).json(savedEntry);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// exports.updatePaymentEntry = async (req, res) => {
//   const { id } = req.params;
//   const { date, amount, mode } = req.body;

//   try {
//     const paymentEntry = await PaymentEntry.findById(id);
//     if (!paymentEntry) {
//       return res.status(404).json({ message: "Payment entry not found" });
//     }

//     // Add new installment
//     paymentEntry.installments.push({ date, amount, mode });

//     // Recalculate total paid amount
//     const totalPaid = paymentEntry.installments.reduce(
//       (sum, inst) => sum + (inst.amount || 0),
//       0
//     );
//     const totalFees = paymentEntry.totalFees;

//     // Update status
//     paymentEntry.status = totalPaid >= totalFees ? "Paid" : "Partial";

//     const updatedEntry = await paymentEntry.save();
//     res.status(200).json(updatedEntry);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// exports.filterTransactions = async (req, res) => {
//   try {
//     // const { duration, fromDate, toDate, category, std, div, mode } = req.query;

//     // let query = {};

//     // // Filter by installment date range
//     // if (fromDate && toDate) {
//     //   query["installments.date"] = {
//     //     $gte: new Date(fromDate),
//     //     $lte: new Date(toDate + "T23:59:59.999Z"), // Include the full day
//     //   };
//     // } else if (duration) {
//     //   const now = new Date();
//     //   if (duration === "Monthly") {
//     //     query["installments.date"] = {
//     //       $gte: new Date(now.getFullYear(), now.getMonth(), 1),
//     //       $lte: new Date(
//     //         now.getFullYear(),
//     //         now.getMonth() + 1,
//     //         0,
//     //         23,
//     //         59,
//     //         59,
//     //         999
//     //       ),
//     //     };
//     //   } else if (duration === "Quarterly") {
//     //     const quarterStart = Math.floor(now.getMonth() / 3) * 3;
//     //     query["installments.date"] = {
//     //       $gte: new Date(now.getFullYear(), quarterStart, 1),
//     //       $lte: new Date(
//     //         now.getFullYear(),
//     //         quarterStart + 3,
//     //         0,
//     //         23,
//     //         59,
//     //         59,
//     //         999
//     //       ),
//     //     };
//     //   } else if (duration === "Yearly") {
//     //     query["installments.date"] = {
//     //       $gte: new Date(now.getFullYear(), 0, 1),
//     //       $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
//     //     };
//     //   }
//     // }

//     // // Filter by standard (std)
//     // if (std) {
//     //   query.std = std.replace(/\D/g, ""); // Convert "5th" to "5" if needed
//     // }

//     // // Filter by division (div)
//     // if (div) query.div = div;

//     // // Filter by payment mode (assuming mode is part of installments)
//     // if (mode) query["installments.mode"] = mode;

//     // // Filter by category (map to std values)
//     // if (category && category !== "All") {
//     //   const categoryMap = {
//     //     Primary: ["1st", "2nd", "3rd", "4th", "5th"],
//     //     Secondary: ["6th", "7th", "8th", "9th", "10th"],
//     //   };
//     //   query.std = {
//     //     $in: categoryMap[category].map((s) => s.replace(/\D/g, "")),
//     //   };
//     // }

//     // // Fetch transactions and populate with installment details
//     // const transactions = await PaymentEntry.find(query).lean().exec();

//     // // Transform data to include relevant fields and handle installments
//     // const formattedTransactions = transactions.map((entry) => ({
//     //   _id: entry._id,
//     //   name: entry.name,
//     //   std: entry.std,
//     //   div: entry.div,
//     //   totalFees: entry.totalFees,
//     //   status: entry.status,
//     //   installments: entry.installments,
//     //   totalPaid: entry.installments.reduce(
//     //     (sum, inst) => sum + (inst.amount || 0),
//     //     0
//     //   ),
//     // }));

//     // res
//     //   .status(200)
//     //   .json(formattedTransactions.length > 0 ? formattedTransactions : []);
//     const transactions = await PaymentEntry.find();
//     res.status(200).json(transactions);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getMetrices = async (req, res) => {
//   try {
//     const transactions = await paymentEntry.find();

//     // Aggregate category totals
//     const categories = ["All", "Pre Primary", "Primary", "Secondary"];
//     const categorySummary = categories.map((category) => {
//       let filtered =
//         category === "All"
//           ? transactions
//           : transactions.filter((t) => t.category === category);

//       let total = filtered.reduce((sum, t) => sum + t.totalFees, 0);
//       let received = filtered.reduce(
//         (sum, t) => sum + (t.totalPaid || 0),
//         0
//       );
//       let pending = total - received;

//       return { category, total, received, pending };
//     });

//     // Aggregate mode distribution
//     const modeSummary = {};
//     transactions.forEach((t) => {
//       t.installments.forEach((inst) => {
//         if (inst.mode) {
//           modeSummary[inst.mode] = (modeSummary[inst.mode] || 0) + inst.amount;
//         }
//       });
//     });

//     res.json({ categorySummary, modeSummary });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// }





// const paymentEntry = require("../models/paymentEntry");
// const PaymentEntry = require("../models/paymentEntry");
// const Student = require("../models/studentModel"); 

// exports.getPaymentEntries = async (req, res) => {
//   try {
//     const { std, div, search } = req.query;
//     let query = {};

//     if (std) query.std = std;
//     if (div) query.div = div;
//     if (search) query.name = { $regex: search, $options: "i" };

//     const paymentEntries = await PaymentEntry.find(query);
//     res.status(200).json(paymentEntries);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.addPaymentEntry = async (req, res) => {
//   const { name, std, div, date, amount, mode } = req.body; 

//   try {
//     // FIX 1: Set status to "Paid" on initial entry, assuming the provided amount covers the total fee set by this transaction.
//     const initialStatus = "Paid"; 

//     const newEntry = new PaymentEntry({
//       name, 
//       std,
//       div,
//       totalFees: amount, // The 'amount' in the body sets the total fee due for this entry
//       status: initialStatus, 
//       installments: [{ date, amount, mode }], 
//     });
    
//     const savedEntry = await newEntry.save();
//     res.status(201).json(savedEntry);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// exports.updatePaymentEntry = async (req, res) => {
//   const { id } = req.params;
//   const { date, amount, mode } = req.body;

//   try {
//     const paymentEntry = await PaymentEntry.findById(id);
//     if (!paymentEntry) {
//       return res.status(404).json({ message: "Payment entry not found" });
//     }

//     // Add new installment
//     paymentEntry.installments.push({ date, amount, mode });

//     // Recalculate total paid amount
//     const totalPaid = paymentEntry.installments.reduce(
//       (sum, inst) => sum + (inst.amount || 0),
//       0
//     );
//     const totalFees = paymentEntry.totalFees;

//     // FIX 2: Update status dynamically based on amount paid vs total fees
//     let newStatus = "Unpaid";
//     if (totalPaid >= totalFees) {
//         newStatus = "Paid";
//     }
    
//     paymentEntry.status = newStatus;

//     const updatedEntry = await paymentEntry.save();
//     res.status(200).json(updatedEntry);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // exports.filterTransactions = async (req, res) => {
// //   try {
// //     const { std } = req.query;

// //     let query = {};

// //     // Filter by standard (std)
// //     if (std) {
// //       query.std = std; 
// //     }
    
// //     // Fetch transactions based on std filter
// //     const transactions = await PaymentEntry.find(query).lean().exec();
    
// //     // Calculate totalPaid for each entry as required by the frontend
// //     const result = transactions.map(entry => ({
// //         ...entry,
// //         totalPaid: entry.installments.reduce((sum, inst) => sum + (inst.amount || 0), 0)
// //     }));


// //     res.status(200).json(result);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };
// exports.filterTransactions = async (req, res) => {
//   try {
//     const { std } = req.query; // std filter is optional, used for performance if only one class is needed

//     let query = {};

//     // Filter by standard (std) - NOTE: This only filters by the single standard number. 
//     // Aggregation for Primary/Secondary is done on the frontend.
//     if (std) {
//       query.std = std; 
//     }
//     
//     // Fetch ALL transactions (or filtered by single standard if `std` is provided)
//     const transactions = await PaymentEntry.find(query).lean().exec();
//     
//     // Calculate totalPaid for each entry
//     const result = transactions.map(entry => ({
//         ...entry,
//         // The frontend only needs the total amount paid so far
//         totalPaid: entry.installments.reduce((sum, inst) => sum + (inst.amount || 0), 0)
//     }));


//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



// exports.getMetrices = async (req, res) => {
//   try {
//     const transactions = await paymentEntry.find();

//     // Aggregate category totals
//     const categories = ["All", "Pre Primary", "Primary", "Secondary"];
//     const categorySummary = categories.map((category) => {
//       let filtered =
//         category === "All"
//           ? transactions
//           : transactions.filter((t) => t.category === category);

//       let total = filtered.reduce((sum, t) => sum + t.totalFees, 0);
//       let received = filtered.reduce(
//         (sum, t) => sum + (t.totalPaid || 0),
//         0
//       );
//       let pending = total - received;

//       return { category, total, received, pending };
//     });

//     // Aggregate mode distribution
//     const modeSummary = {};
//     transactions.forEach((t) => {
//       t.installments.forEach((inst) => {
//         if (inst.mode) {
//           modeSummary[inst.mode] = (modeSummary[inst.mode] || 0) + inst.amount;
//         }
//       });
//     });

//     res.json({ categorySummary, modeSummary });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// }

// exports.sendReminder = async (req, res) => {
//     try {
//         const { fromDate, toDate, category } = req.body;

//         // --- Step 1: Initialize Student Query based on category filter ---
//         let studentQuery = { status: true };
        
//         // Pre-Primary standard names
//         const prePrimaryStandards = ["Nursery", "Junior", "Senior", "Jr KG", "Sr KG"];
//         // Primary and Secondary standards for querying
//         const primaryStandards = ["1", "2", "3", "4", "5", "6", "7", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
//         const secondaryStandards = ["8", "9", "10", "8th", "9th", "10th"];

//         if (category && category !== "All") {
//             let standardList = [];
            
//             if (category === "Pre-Primary") { // NEW Pre-Primary logic
//                 standardList = prePrimaryStandards;
//             }
//             else if (category === "Primary") {
//                 standardList = primaryStandards;
//             } else if (category === "Secondary") {
//                 standardList = secondaryStandards;
//             }
            
//             // Apply the filter
//             if (standardList.length > 0) {
//                 studentQuery["admission.admissionstd"] = { $in: standardList };
//             }
//         }
        
//         // --- Step 2: Fetch Student Records ---
//         const students = await Student.find(studentQuery).lean();
        
//         let remindersSent = 0;
//         let remindersSimulated = [];

//         // --- Step 3: Loop through students and simulate sending reminders ---
//         for (const student of students) {
//             // MOCK: Assuming all fetched students need a reminder
            
//             const studentName = `${student.firstname} ${student.lastname}`;
//             const studentStd = student.admission.admissionstd;
//             const contact = student.parent.primarycontact;

//             if (contact) {
//                 const dueDate = toDate ? new Date(toDate).toDateString() : 'the next due date';
//                 const message = `🔔 Fee Reminder: A payment is pending for your child ${studentName} (${studentStd}). Please make the payment by ${dueDate}.`;
                
//                 // --- Step 4: Simulate Notification/SMS Delivery ---
//                 console.log(`[REMINDER SENT SIMULATION] 
//                 To: ${studentName} 
//                 Std: ${studentStd} 
//                 Contact: ${contact} 
//                 Message: ${message}`);
                
//                 remindersSimulated.push({ name: studentName, contact: contact });
//                 remindersSent++;
//             }
//         }

//         if (remindersSent > 0) {
//             return res.status(200).json({ 
//                 message: `Successfully simulated sending fee reminders to ${remindersSent} students.`,
//                 recipients: remindersSimulated
//             });
//         } else {
//             return res.status(200).json({ 
//                 message: "No students found matching the criteria or no contact information available.",
//                 recipients: []
//             });
//         }

//     } catch (error) {
//         console.error("Error executing sendReminder (Fatal):", error);
//         return res.status(500).json({ error: error.message || "Failed to process reminder request (Server Error)." });
//     }
// };





// const paymentEntry = require("../models/paymentEntry");
// const PaymentEntry = require("../models/paymentEntry");
// const Student = require("../models/studentModel"); 
// const Fee = require("../models/feeModel"); 

// // Helper to normalize standard name/number for Fee lookup
// const normalizeStd = (std) => {
//     if (!std) return '';
//     if (["Nursery", "Junior", "Senior"].includes(std)) {
//         return std;
//     }
//     const num = String(std).replace(/\D/g, ""); 
//     return num || std; 
// };

// // --- FIX: Define comprehensive standard lists for robust Category filtering ---
// const PP_STDS_QUERY = ["Nursery", "Junior", "Senior", "Jr KG", "Sr KG"];

// const P_STDS_QUERY = [
//     // Primary (1 to 7) - Includes numeric, 'st', 'nd', 'rd', 'th' forms for robust matching
//     "1", "2", "3", "4", "5", "6", "7", 
//     "1st", "2nd", "3rd", "4th", "5th", "6th", "7th",
//     "Jr KG", "Sr KG" // Included just in case Primary contains KG standards in some data entry
// ]; 

// const S_STDS_QUERY = [
//     // Secondary (8 to 10) - Includes numeric and 'th' forms
//     "8", "9", "10", 
//     "8th", "9th", "10th"
// ]; 
// // ----------------------------------------------


// exports.getPaymentEntries = async (req, res) => {
// // ... (omitted for brevity - unchanged)
//   try {
//     const { std, div, search } = req.query;
//     let query = {};

//     if (std) query.std = std;
//     if (div) query.div = div;
//     if (search) query.name = { $regex: search, $options: "i" };

//     const paymentEntries = await PaymentEntry.find(query);
//     res.status(200).json(paymentEntries);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.addPaymentEntry = async (req, res) => {
// // ... (omitted for brevity - unchanged)
//   const { name, std, div, date, amount, mode } = req.body; 

//   try {
//     const initialStatus = "Paid"; 

//     const newEntry = new PaymentEntry({
//       name, 
//       std,
//       div,
//       totalFees: amount, // The 'amount' in the body sets the total fee due for this entry
//       status: initialStatus, 
//       installments: [{ date, amount, mode }], 
//     });
//     
//     const savedEntry = await newEntry.save();
//     res.status(201).json(savedEntry);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// exports.updatePaymentEntry = async (req, res) => {
// // ... (omitted for brevity - unchanged)
//   const { id } = req.params;
//   const { date, amount, mode } = req.body;

//   try {
//     const paymentEntry = await PaymentEntry.findById(id);
//     if (!paymentEntry) {
//       return res.status(404).json({ message: "Payment entry not found" });
//     }

//     // Add new installment
//     paymentEntry.installments.push({ date, amount, mode });

//     // Recalculate total paid amount
//     const totalPaid = paymentEntry.installments.reduce(
//       (sum, inst) => sum + (inst.amount || 0),
//       0
//     );
//     const totalFees = paymentEntry.totalFees;

//     // FIX 2: Update status dynamically based on amount paid vs total fees
//     let newStatus = "Unpaid";
//     if (totalPaid >= totalFees) {
//         newStatus = "Paid";
//     }
//     
//     paymentEntry.status = newStatus;

//     const updatedEntry = await paymentEntry.save();
//     res.status(200).json(updatedEntry);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // FIX: Corrected filterTransactions to handle Category filters and enrich data
// exports.filterTransactions = async (req, res) => {
//   try {
//     const { std, div, search, category, mode } = req.query; 
//     
//     // --- Determine Standard Filter List (if category group is used) ---
//     let finalStdQuery = std;

//     if (category && category !== "All") {
//         let standardList = [];
//         if (category === "Pre-Primary") {
//             standardList = PP_STDS_QUERY;
//         } else if (category === "Primary") {
//             standardList = P_STDS_QUERY;
//         } else if (category === "Secondary") {
//             standardList = S_STDS_QUERY;
//         }
//         
//         // If a category group is selected AND no specific standard is provided, use the list.
//         if (standardList.length > 0 && !std) {
//             finalStdQuery = { $in: standardList };
//         }
//     }
//     
//     // --- Build Query ---
//     let query = {};

//     // 1. Filter by Standard (using individual standard OR category list)
//     if (finalStdQuery) {
//         query.std = finalStdQuery;
//     }
//     
//     // 2. Filter by Division and Search
//     if (div) query.div = div;
//     if (search) query.name = { $regex: search, $options: "i" };
//     
//     // 3. Filter by Mode (requires matching mode in at least one installment)
//     if (mode) {
//         query["installments.mode"] = mode;
//     }

//     // 4. Fetch Master Fee Structure for lookup
//     const allFees = await Fee.find().lean();
//     const feeMap = allFees.reduce((acc, fee) => {
//         acc[normalizeStd(fee.standard)] = fee.annualfee || 0;
//         return acc;
//     }, {});
//     
//     // Fetch filtered transactions
//     const transactions = await PaymentEntry.find(query).lean().exec();
//     
//     // Calculate totalPaid and apply the TRUE Annual Fee Due
//     const result = transactions.map(entry => {
//         const totalPaid = entry.installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
//         
//         // Get the correct Annual Fee from the fee map
//         const correctAnnualFee = feeMap[normalizeStd(entry.std)] || 0;

//         return {
//             ...entry,
//             // OVERRIDE totalFees with the correct value from the master fees table
//             totalFees: correctAnnualFee, 
//             totalPaid: totalPaid,
//         };
//     });


//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getMetrices = async (req, res) => {
// // ... (omitted for brevity - unchanged)
//   try {
//     const transactions = await paymentEntry.find();

//     // Aggregate category totals
//     const categories = ["All", "Pre Primary", "Primary", "Secondary"];
//     const categorySummary = categories.map((category) => {
//       let filtered =
//         category === "All"
//           ? transactions
//           : transactions.filter((t) => t.category === category);

//       let total = filtered.reduce((sum, t) => sum + t.totalFees, 0);
//       let received = filtered.reduce(
//         (sum, t) => sum + (t.totalPaid || 0),
//         0
//       );
//       let pending = total - received;

//       return { category, total, received, pending };
//     });

//     // Aggregate mode distribution
//     const modeSummary = {};
//     transactions.forEach((t) => {
//       t.installments.forEach((inst) => {
//         if (inst.mode) {
//           modeSummary[inst.mode] = (modeSummary[inst.mode] || 0) + inst.amount;
//         }
//       });
//     });

//     res.json({ categorySummary, modeSummary });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// }

// exports.sendReminder = async (req, res) => {
//     try {
//         const { fromDate, toDate, category } = req.body;

//         // --- Step 1: Initialize Student Query based on category filter ---
//         let studentQuery = { status: true };
//         
//         // Removed redundant standard definitions (PP_STDS, P_STDS, S_STDS, etc.)
//         // and now using the centrally defined PP_STDS_QUERY, P_STDS_QUERY, S_STDS_QUERY.
//         
//         if (category && category !== "All") {
//             let standardList = [];
//             
//             if (category === "Pre-Primary") { 
//                 standardList = PP_STDS_QUERY; 
//             }
//             else if (category === "Primary") {
//                 standardList = P_STDS_QUERY;
//             } else if (category === "Secondary") {
//                 standardList = S_STDS_QUERY;
//             }
//             
//             // Apply the filter
//             if (standardList.length > 0) {
//                 studentQuery["admission.admissionstd"] = { $in: standardList };
//             }
//         }
//         
//         // --- Step 2: Fetch Student Records ---
//         const students = await Student.find(studentQuery).lean();
//         
//         let remindersSent = 0;
//         let remindersSimulated = [];

//         // --- Step 3: Loop through students and simulate sending reminders ---
//         for (const student of students) {
//             // MOCK: Assuming all fetched students need a reminder
//             
//             const studentName = `${student.firstname} ${student.lastname}`;
//             const studentStd = student.admission.admissionstd;
//             const contact = student.parent.primarycontact;

//             if (contact) {
//                 const dueDate = toDate ? new Date(toDate).toDateString() : 'the next due date';
//                 const message = `🔔 Fee Reminder: A payment is pending for your child ${studentName} (${studentStd}). Please make the payment by ${dueDate}.`;
//                 
//                 // --- Step 4: Simulate Notification/SMS Delivery ---
//                 console.log(`[REMINDER SENT SIMULATION] 
//                 To: ${studentName} 
//                 Std: ${studentStd} 
//                 Contact: ${contact} 
//                 Message: ${message}`);
//                 
//                 remindersSimulated.push({ name: studentName, contact: contact });
//                 remindersSent++;
//             }
//         }

//         if (remindersSent > 0) {
//             return res.status(200).json({ 
//                 message: `Successfully simulated sending fee reminders to ${remindersSent} students.`,
//                 recipients: remindersSimulated
//             });
//         } else {
//             return res.status(200).json({ 
//                 message: "No students found matching the criteria or no contact information available.",
//                 recipients: []
//             });
//         }

//     } catch (error) {
//         console.error("Error executing sendReminder (Fatal):", error);
//         return res.status(500).json({ error: error.message || "Failed to process reminder request (Server Error)." });
//     }
// };



const paymentEntry = require("../models/paymentEntry");
const PaymentEntry = require("../models/paymentEntry");
const Student = require("../models/studentModel"); 
const Fee = require("../models/feeModel"); 

// Helper to normalize standard name/number for Fee lookup
const normalizeStd = (std) => {
    if (!std) return '';
    if (["Nursery", "Junior", "Senior"].includes(std)) {
        return std;
    }
    const num = String(std).replace(/\D/g, ""); 
    return num || std; 
};

// --- Standard Definitions for Group Filtering (Used in FeesCollection/Dashboard) ---
const PP_STDS_QUERY = ["Nursery", "Junior", "Senior", "Jr KG", "Sr KG"];

const P_STDS_QUERY = [
    // Primary (1 to 7) - Includes numeric, 'st', 'nd', 'rd', 'th' forms for robust matching
    "1", "2", "3", "4", "5", "6", "7", 
    "1st", "2nd", "3rd", "4th", "5th", "6th", "7th",
    "Jr KG", "Sr KG" 
]; 

const S_STDS_QUERY = [
    // Secondary (8 to 10) - Includes numeric and 'th' forms
    "8", "9", "10", 
    "8th", "9th", "10th"
]; 
// ----------------------------------------------


exports.getPaymentEntries = async (req, res) => {
  try {
    const { std, div, search } = req.query;
    let query = {};

    if (std) query.std = std;
    if (div) query.div = div;
    if (search) query.name = { $regex: search, $options: "i" };

    const paymentEntries = await PaymentEntry.find(query);
    res.status(200).json(paymentEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addPaymentEntry = async (req, res) => {
// ... (omitted for brevity - unchanged)
  const { name, std, div, date, amount, mode } = req.body; 

  try {
    const initialStatus = "Paid"; 

    const newEntry = new PaymentEntry({
      name, 
      std,
      div,
      totalFees: amount, // The 'amount' in the body sets the total fee due for this entry
      status: initialStatus, 
      installments: [{ date, amount, mode }], 
    });
    
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePaymentEntry = async (req, res) => {
// ... (omitted for brevity - unchanged)
  const { id } = req.params;
  const { date, amount, mode } = req.body;

  try {
    const paymentEntry = await PaymentEntry.findById(id);
    if (!paymentEntry) {
      return res.status(404).json({ message: "Payment entry not found" });
    }

    // Add new installment
    paymentEntry.installments.push({ date, amount, mode });

    // Recalculate total paid amount
    const totalPaid = paymentEntry.installments.reduce(
      (sum, inst) => sum + (inst.amount || 0),
      0
    );
    const totalFees = paymentEntry.totalFees;

    // FIX 2: Update status dynamically based on amount paid vs total fees
    let newStatus = "Unpaid";
    if (totalPaid >= totalFees) {
        newStatus = "Paid";
    }
    
    paymentEntry.status = newStatus;

    const updatedEntry = await paymentEntry.save();
    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// FIX: Final corrected filterTransactions to handle Category filters and enrich data
exports.filterTransactions = async (req, res) => {
  try {
    const { std, div, search, category, mode } = req.query; 
    
    // --- Determine Standard Filter ---
    let query = {};

    // 1. Determine Standard Filter (Individual Standard takes precedence over Category Group)
    if (std) {
        query.std = std;
    } else if (category && category !== "All") {
        let standardList = [];
        if (category === "Pre-Primary") {
            standardList = PP_STDS_QUERY;
        } else if (category === "Primary") {
            standardList = P_STDS_QUERY;
        } else if (category === "Secondary") {
            standardList = S_STDS_QUERY;
        }
        
        if (standardList.length > 0) {
            query.std = { $in: standardList };
        }
    }
    
    // 2. Filter by Division and Search
    if (div) query.div = div;
    if (search) query.name = { $regex: search, $options: "i" };
    
    // 3. Filter by Mode 
    if (mode) {
        query["installments.mode"] = mode;
    }

    // 4. Fetch Master Fee Structure for lookup
    const allFees = await Fee.find().lean();
    const feeMap = allFees.reduce((acc, fee) => {
        acc[normalizeStd(fee.standard)] = fee.annualfee || 0;
        return acc;
    }, {});
    
    // Fetch filtered transactions
    const transactions = await PaymentEntry.find(query).lean().exec();
    
    // Calculate totalPaid and apply the TRUE Annual Fee Due
    const result = transactions.map(entry => {
        const totalPaid = entry.installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
        
        // Get the correct Annual Fee from the fee map
        const correctAnnualFee = feeMap[normalizeStd(entry.std)] || 0;

        return {
            ...entry,
            // OVERRIDE totalFees with the correct value from the master fees table
            totalFees: correctAnnualFee, 
            totalPaid: totalPaid,
        };
    });


    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMetrices = async (req, res) => {
// ... (omitted for brevity - unchanged)
  try {
    const transactions = await paymentEntry.find();

    // Aggregate category totals
    const categories = ["All", "Pre Primary", "Primary", "Secondary"];
    const categorySummary = categories.map((category) => {
      let filtered =
        category === "All"
          ? transactions
          : transactions.filter((t) => t.category === category);

      let total = filtered.reduce((sum, t) => sum + t.totalFees, 0);
      let received = filtered.reduce(
        (sum, t) => sum + (t.totalPaid || 0),
        0
      );
      let pending = total - received;

      return { category, total, received, pending };
    });

    // Aggregate mode distribution
    const modeSummary = {};
    transactions.forEach((t) => {
      t.installments.forEach((inst) => {
        if (inst.mode) {
          modeSummary[inst.mode] = (modeSummary[inst.mode] || 0) + inst.amount;
        }
      });
    });

    res.json({ categorySummary, modeSummary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.sendReminder = async (req, res) => {
    try {
        const { fromDate, toDate, category } = req.body;

        // --- Step 1: Initialize Student Query based on category filter ---
        let studentQuery = { status: true };
        
        // Define standard lists using the groups defined above
        const PP_STDS = ["Nursery", "Junior", "Senior"];
        const P_STDS = ["1", "2", "3", "4", "5", "6", "7"]; 
        const S_STDS = ["8", "9", "10"]; 
        
        // Include both numeric and string forms for robust filtering
        const P_STDS_EXT = P_STDS.flatMap(s => [`${s}st`, `${s}nd`, `${s}rd`, `${s}th`]).filter(n => n).concat(P_STDS);
        const S_STDS_EXT = S_STDS.flatMap(s => [`${s}th`]).concat(S_STDS);

        if (category && category !== "All") {
            let standardList = [];
            
            if (category === "Pre-Primary") { 
                standardList = PP_STDS_QUERY; 
            }
            else if (category === "Primary") {
                standardList = P_STDS_QUERY;
            } else if (category === "Secondary") {
                standardList = S_STDS_QUERY;
            }
            
            // Apply the filter
            if (standardList.length > 0) {
                studentQuery["admission.admissionstd"] = { $in: standardList };
            }
        }
        
        // --- Step 2: Fetch Student Records ---
        const students = await Student.find(studentQuery).lean();
        
        let remindersSent = 0;
        let remindersSimulated = [];

        // --- Step 3: Loop through students and simulate sending reminders ---
        for (const student of students) {
            // MOCK: Assuming all fetched students need a reminder
            
            const studentName = `${student.firstname} ${student.lastname}`;
            const studentStd = student.admission.admissionstd;
            const contact = student.parent.primarycontact;

            if (contact) {
                const dueDate = toDate ? new Date(toDate).toDateString() : 'the next due date';
                const message = `🔔 Fee Reminder: A payment is pending for your child ${studentName} (${studentStd}). Please make the payment by ${dueDate}.`;
                
                // --- Step 4: Simulate Notification/SMS Delivery ---
                console.log(`[REMINDER SENT SIMULATION] 
                To: ${studentName} 
                Std: ${studentStd} 
                Contact: ${contact} 
                Message: ${message}`);
                
                remindersSimulated.push({ name: studentName, contact: contact });
                remindersSent++;
            }
        }

        if (remindersSent > 0) {
            return res.status(200).json({ 
                message: `Successfully simulated sending fee reminders to ${remindersSent} students.`,
                recipients: remindersSimulated
            });
        } else {
            return res.status(200).json({ 
                message: "No students found matching the criteria or no contact information available.",
                recipients: []
            });
        }

    } catch (error) {
        console.error("Error executing sendReminder (Fatal):", error);
        return res.status(500).json({ error: error.message || "Failed to process reminder request (Server Error)." });
    }
};