const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    staffid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstname: { type: String, required: true, trim: true,  },
    middlename: { type: String, trim: true,  },
    lastname: { type: String, required: true, trim: true,  },
    dob: { type: Date, required: true },
    maritalstatus: {
      type: String,
    },
    bloodgroup: {
      type: String,      
    },
    gender: {
      type: String,
      required: true,
      
    },
    category: { type: String, required: true,  },
    nationality: { type: String, required: true,  },
    aadharno: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{12}$/,
    },
    photo: { type: String, default: "" },
    status: { type: Boolean, default: true },
    phoneno: { type: String, required: true, match: /^[0-9]{10}$/ },
    alternatephoneno: { type: String, match: /^[0-9]{10}$/ },
    password: { type: String, default: "teacher@123", required: true },
    emailaddress: { type: String, match: /.+\@.+\..+/,  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("staff", staffSchema);