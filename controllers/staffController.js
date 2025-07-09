const Staff = require("../models/staffModel");
const staffAddress = require("../models/staffAddressModel");
const staffEductaion = require("../models/staffEducationModel");
const staffExperience = require("../models/staffExperienceModel");
const staffRole = require("../models/staffRole");
const staffBank = require("../models/staffBank");
const staffTransport = require("../models/staffTransport");
const staffDocs = require("../models/staffDocument");

// list all staff
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    return res.status(200).json(staff);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// add staff
exports.addStaff = async (req, res) => {
  try {
    const data = req.body;
    const staff = new Staff({
      staffid: data.staffid,
      firstname: data.firstname,
      middlename: data.middlename,
      lastname: data.lastname,
      dob: data.dob,
      maritalstatus: data.maritalstatus,
      bloodgroup: data.bloodgroup,
      gender: data.gender,
      category: data.category,
      nationality: data.nationality,
      aadharno: data.aadharno,
      photo: data.photo,
      status: data.status,
      phoneno: data.phoneno,
      alternatephoneno: data.alternatephoneno,
      password: data.password,
      emailaddress: data.emailaddress,
    });
    await staff.save();

    const staffadd = new staffAddress({
      staffid: data.staffid,
      addressline1: data.addressline1,
      addressline2: data.addressline2,
      city: data.city,
      postalcode: data.postalcode,
      district: data.district,
      state: data.state,
      country: data.country,
    });
    await staffadd.save();

    const staffeduc = new staffEductaion({
      staffid: data.staffid,
      highestqualification: data.highestqualification,
      yearofpassing: data.yearofpassing,
      specialization: data.specialization,
      certificates: data.certificates,
      universityname: data.universityname,
    });
    await staffeduc.save();

    const staffexp = new staffExperience({
      staffid: data.staffid,
      totalexperience: data.totalexperience,
      designation: data.designation,
      previousemployer: data.previousemployer,
      subjectstaught: data.subjectstaught,
      reasonforleaving: data.reasonforleaving,
    });
    await staffexp.save();

    const staffrole = new staffRole({
      staffid: data.staffid,
      position: staff.position,
      dept: data.dept,
      preferredgrades: data.preferredgrades,
      joiningdate: data.joiningdate,
    });
    await staffrole.save();

    const staffbank = new staffBank({
      staffid: data.staffid,
      bankname: data.bankname,
      branchname: data.branchname,
      accno: data.accno,
      ifccode: data.ifccode,
      panno: data.panno,
    });
    await staffbank.save();

    const stafftransport = new staffTransport({
      staffid: data.staffid,
      transportstatus: data.transportstatus,
      pickuppoint: data.pickuppoint,
      droppoint: data.droppoint,
      modetransport: data.modetransport,
    });
    await stafftransport.save();

    const docs = new staffDocs({
      staffid: data.staffid,
      documentsurl: data.documentsurl,
    });
    await docs.save();

    return res.status(200).json({ message: "staff added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// list of all staff leave requests
exports.getLeave = async (req, res) => {};