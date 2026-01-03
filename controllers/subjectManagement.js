// const subjectModel = require("../models/subjectsModel");

// exports.addSubject = async (req, res) => {
//   try {
//     const { subjectname, standard } = req.body;
//     if (!subjectname || !standard) {
//       return res
//         .status(400)
//         .json({ message: "Subject name and standard are required" });
//     }
//     const newSubject = new subjectModel({ subjectname, standard });
//     await newSubject.save();
//     res
//       .status(201)
//       .json({ message: "Subject added successfully", subject: newSubject });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.getSubjectsByStandard = async (req, res) => {
//   try {
//     const { standard } = req.params;
//     const subjects = await subjectModel.find({ standard });
//     if (subjects.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No subjects found for this standard" });
//     }
//     res.status(200).json({ subjects });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.getAllSubjects = async (req, res) =>
// {
//   try
//   {
//     const response = await subjectModel.find();
//     return res.status(200).json(response);
//   }
//   catch(error)
//   {
//     return res.status(500).error({error: error.message})
//   }
// }





const subjectModel = require("../models/subjectsModel");

// exports.addSubject = async (req, res) => {
//   try {
//     const { subjectname, standard } = req.body;
//     if (!subjectname || !standard) {
//       return res
//         .status(400)
//         .json({ message: "Subject name and standard are required" });
//     }
//     const newSubject = new subjectModel({ subjectname, standard });
//     await newSubject.save();
//     res
//       .status(201)
//       .json({ message: "Subject added successfully", subject: newSubject });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

exports.addSubject = async (req, res) => {
  try {
    const { standard, subjects } = req.body;

    if (!standard || !subjects || subjects.length === 0) {
      return res.status(400).json({ message: "Standard and subjects data are required" });
    }

    // Check if subjects already exist for this standard to perform an update or create
    let existingRecord = await subjectModel.findOne({ standard });

    if (existingRecord) {
      // Logic: Overwrite with the new master list for this standard
      existingRecord.subjects = subjects;
      await existingRecord.save();
      return res.status(200).json({ message: "Subjects updated successfully", subject: existingRecord });
    } else {
      // Create new record
      const newRecord = new subjectModel({ standard, subjects });
      await newRecord.save();
      return res.status(201).json({ message: "Subjects created successfully", subject: newRecord });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getSubjectsByStandard = async (req, res) => {
  try {
    const { standard } = req.params;
    
    // Query the database for subjects matching the standard
    const subjects = await subjectModel.find({ standard: standard });
    
    // MODIFIED: Return 200 OK even if the list is empty, preventing a 404 client error.
    if (subjects.length === 0) {
      return res
        .status(200) 
        .json({ message: "No subjects found for this standard", subjects: [] });
    }
    
    res.status(200).json({ subjects });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// exports.getAllSubjects = async (req, res) =>
// {
//   try
//   {
//     const response = await subjectModel.find();
//     return res.status(200).json(response);
//   }
//   catch(error)
//   {
//     return res.status(500).error({error: error.message})
//   }
// }

// GET all subjects for the main listing table
exports.getAllSubjects = async (req, res) => {
  try {
    const response = await subjectModel.find();
    // Transform data for the UI table if necessary
    const formattedResponse = response.map(item => ({
      _id: item._id,
      standard: item.standard,
      // Map subject names into a single string for the "Subject Names" column
      subjectName: item.subjects.map(s => s.name) 
    }));
    return res.status(200).json(formattedResponse);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// Get Single Subject Configuration
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await subjectModel.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject configuration not found" });
    }
    // Returns the full object including standard and subjects array
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Subject Configuration
exports.updateSubject = async (req, res) => {
  try {
    const { standard, subjects } = req.body;
    
    const updated = await subjectModel.findByIdAndUpdate(
      req.params.id, 
      { standard, subjects }, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Subject configuration not found" });
    }
    
    res.status(200).json({ message: "Updated successfully", subject: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Subject Configuration
exports.deleteSubject = async (req, res) => {
  try {
    await subjectModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};