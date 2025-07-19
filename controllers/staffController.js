const Staff = require("../models/staffModel");
const staffAddress = require("../models/staffAddressModel");
const staffEductaion = require("../models/staffEducationModel");
const staffExperience = require("../models/staffExperienceModel");
const staffRole = require("../models/staffRole");
const staffBank = require("../models/staffBank");
const staffTransport = require("../models/staffTransport");
const staffDocs = require("../models/staffDocument");
const staffLeave = require("../models/staffLeave");

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

// add leave request for staff
exports.addLeave = async (req, res) => {
  try {
    const leave = new staffLeave(req.body);
    await leave.save();

    return res.status(200).json({ message: "request sent successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get all leave requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await staffLeave.find(); // all leave requests
    const staffList = await Staff.find({}, "staffid firstname lastname dept position _id");

    const staffMap = {};
    staffList.forEach((staff) => {
      if (staff.staffid) {
        staffMap[staff.staffid.toString()] = staff;
      }
    });

    const merged = requests.map((r) => {
      const staffInfo = staffMap[r.staffid] || {};
      return {
        _id: r._id,
        subject: r.subject,
        message: r.message,
        status: r.status,
        submitted_at: r.submitted_at,
        from: r.from,
        to: r.to,
        staffid: r.staffid,
        firstname: staffInfo.firstname || "",
        lastname: staffInfo.lastname || "",
        dept: staffInfo.dept || "",
        position: staffInfo.position || "",
      };
    });

    return res.status(200).json(merged);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// update request status
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected','Pending',"Approved","Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be one of: Pending, Approved, Rejected" });
    }

    console.log('requested id', id)
    console.log('status',status)
    const updatedRequest = await staffLeave.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true } 
    );
    console.log('updated req',updatedRequest)
    if (!updatedRequest) {
      return res.status(404).json({ error: "staff request not found" });
    }

    return res.status(200).json({ 
      message: "staff request updated successfully",
      request: updatedRequest 
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({ error: error.message }); 
  }
};