const paymentEntry = require("../models/paymentEntry");
const PaymentEntry = require("../models/paymentEntry");

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
  const { name, std, div, date, installmentType, amount, mode } = req.body;

  try {
    const newEntry = new PaymentEntry({
      name,
      std,
      div,
      totalFees: amount,
      status: "Unpaid",
      installments: [{ date, amount }],
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

    // Update status
    paymentEntry.status = totalPaid >= totalFees ? "Paid" : "Partial";

    const updatedEntry = await paymentEntry.save();
    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.filterTransactions = async (req, res) => {
  try {
    // const { duration, fromDate, toDate, category, std, div, mode } = req.query;

    // let query = {};

    // // Filter by installment date range
    // if (fromDate && toDate) {
    //   query["installments.date"] = {
    //     $gte: new Date(fromDate),
    //     $lte: new Date(toDate + "T23:59:59.999Z"), // Include the full day
    //   };
    // } else if (duration) {
    //   const now = new Date();
    //   if (duration === "Monthly") {
    //     query["installments.date"] = {
    //       $gte: new Date(now.getFullYear(), now.getMonth(), 1),
    //       $lte: new Date(
    //         now.getFullYear(),
    //         now.getMonth() + 1,
    //         0,
    //         23,
    //         59,
    //         59,
    //         999
    //       ),
    //     };
    //   } else if (duration === "Quarterly") {
    //     const quarterStart = Math.floor(now.getMonth() / 3) * 3;
    //     query["installments.date"] = {
    //       $gte: new Date(now.getFullYear(), quarterStart, 1),
    //       $lte: new Date(
    //         now.getFullYear(),
    //         quarterStart + 3,
    //         0,
    //         23,
    //         59,
    //         59,
    //         999
    //       ),
    //     };
    //   } else if (duration === "Yearly") {
    //     query["installments.date"] = {
    //       $gte: new Date(now.getFullYear(), 0, 1),
    //       $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
    //     };
    //   }
    // }

    // // Filter by standard (std)
    // if (std) {
    //   query.std = std.replace(/\D/g, ""); // Convert "5th" to "5" if needed
    // }

    // // Filter by division (div)
    // if (div) query.div = div;

    // // Filter by payment mode (assuming mode is part of installments)
    // if (mode) query["installments.mode"] = mode;

    // // Filter by category (map to std values)
    // if (category && category !== "All") {
    //   const categoryMap = {
    //     Primary: ["1st", "2nd", "3rd", "4th", "5th"],
    //     Secondary: ["6th", "7th", "8th", "9th", "10th"],
    //   };
    //   query.std = {
    //     $in: categoryMap[category].map((s) => s.replace(/\D/g, "")),
    //   };
    // }

    // // Fetch transactions and populate with installment details
    // const transactions = await PaymentEntry.find(query).lean().exec();

    // // Transform data to include relevant fields and handle installments
    // const formattedTransactions = transactions.map((entry) => ({
    //   _id: entry._id,
    //   name: entry.name,
    //   std: entry.std,
    //   div: entry.div,
    //   totalFees: entry.totalFees,
    //   status: entry.status,
    //   installments: entry.installments,
    //   totalPaid: entry.installments.reduce(
    //     (sum, inst) => sum + (inst.amount || 0),
    //     0
    //   ),
    // }));

    // res
    //   .status(200)
    //   .json(formattedTransactions.length > 0 ? formattedTransactions : []);
    const transactions = await PaymentEntry.find();
    res.status(200).json(transactions);
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