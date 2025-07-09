const mongoose = require("mongoose");

const staffBankSchema = new mongoose.Schema({
  bankid: { type: String, required: true, unique: true, default:Date.now() },
  staffid: { type: String, required: true, ref: "staff" },
  bankname: { type: String, lowercase: true },
  branchname: { type: String, lowercase: true },
  accno: { type: String },
  ifccode: { type: String, uppercase: true },
  panno: { type: String, uppercase: true }
});

module.exports = mongoose.model("staff_bank", staffBankSchema);
