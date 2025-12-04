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





const paymentEntry = require("../models/paymentEntry");
const PaymentEntry = require("../models/paymentEntry");
const Student = require("../models/studentModel"); 

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
  const { name, std, div, date, amount, mode } = req.body; 

  try {
    // FIX 1: Set status to "Paid" on initial entry, assuming the provided amount covers the total fee set by this transaction.
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

// exports.filterTransactions = async (req, res) => {
//   try {
//     const { std } = req.query;

//     let query = {};

//     // Filter by standard (std)
//     if (std) {
//       query.std = std; 
//     }
    
//     // Fetch transactions based on std filter
//     const transactions = await PaymentEntry.find(query).lean().exec();
    
//     // Calculate totalPaid for each entry as required by the frontend
//     const result = transactions.map(entry => ({
//         ...entry,
//         totalPaid: entry.installments.reduce((sum, inst) => sum + (inst.amount || 0), 0)
//     }));


//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
exports.filterTransactions = async (req, res) => {
  try {
    const { std } = req.query; // std filter is optional, used for performance if only one class is needed

    let query = {};

    // Filter by standard (std) - NOTE: This only filters by the single standard number. 
    // Aggregation for Primary/Secondary is done on the frontend.
    if (std) {
      query.std = std; 
    }
    
    // Fetch ALL transactions (or filtered by single standard if `std` is provided)
    const transactions = await PaymentEntry.find(query).lean().exec();
    
    // Calculate totalPaid for each entry
    const result = transactions.map(entry => ({
        ...entry,
        // The frontend only needs the total amount paid so far
        totalPaid: entry.installments.reduce((sum, inst) => sum + (inst.amount || 0), 0)
    }));


    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.getMetrices = async (req, res) => {
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

        if (category && category !== "All") {
            let standardList = [];
            
            if (category === "Primary") {
                // FIX: Correctly defining the array of standard strings for Primary (1st to 7th)
                standardList = ["1", "2", "3", "4", "5", "6", "7", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
            } else if (category === "Secondary") {
                // FIX: Correctly defining the array of standard strings for Secondary (8th to 10th)
                standardList = ["8", "9", "10", "8th", "9th", "10th"];
            }
            
            // Only apply the filter if the category was Primary or Secondary
            if (standardList.length > 0) {
                studentQuery["admission.admissionstd"] = { $in: standardList };
            }
            // Note: Add logic here if you want to filter by a specific single standard string
        }
        
        // --- Step 2: Fetch Student Records ---
        // Ensure the Student model is correctly imported (FIX)
        const students = await Student.find(studentQuery).lean();
        
        let remindersSent = 0;
        let remindersSimulated = [];

        // --- Step 3: Loop through students and simulate sending reminders ---
        for (const student of students) {
            // MOCK: In a real app, you would join PaymentEntry data here to check for pending fees.
            // Since we assume all fetched students need a reminder:
            
            const studentName = `${student.firstname} ${student.lastname}`;
            const studentStd = student.admission.admissionstd;
            const contact = student.parent.primarycontact;

            if (contact) {
                // The toDate should ideally be converted to a readable format
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
        // Returning 500 error details here to help debugging, but the user requested fixing the 500.
        // The most likely fix is the Student model import/definition.
        return res.status(500).json({ error: error.message || "Failed to process reminder request (Server Error)." });
    }
};