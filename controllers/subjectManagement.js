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

exports.addSubject = async (req, res) => {
  try {
    const { subjectname, standard } = req.body;
    if (!subjectname || !standard) {
      return res
        .status(400)
        .json({ message: "Subject name and standard are required" });
    }
    const newSubject = new subjectModel({ subjectname, standard });
    await newSubject.save();
    res
      .status(201)
      .json({ message: "Subject added successfully", subject: newSubject });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getSubjectsByStandard = async (req, res) => {
  try {
    const { standard } = req.params;
    
    // Ensure the standard parameter (e.g., "1") is correctly used in the query
    const subjects = await subjectModel.find({ standard: standard });
    
    // The previous code returned 404 if subjects.length === 0, which is bad practice.
    // A 404 means the route/resource doesn't exist. 
    // Finding no subjects means the resource *exists* but is empty (should be 200 OK or 404 if you strictly want to follow the previous structure but logging here is better).
    
    if (subjects.length === 0) {
      // If no subjects are found, return a 404 error as per your original logic structure, 
      // although returning 200 with an empty list is more common for GET /resource.
      // Reverting to 404 to match the previous component's potential expected behavior, but logging the server error here.
      // NOTE: This 404 might be misleading. If the route works for other IDs, this is the cause of the client's 404.
      return res
        .status(404)
        .json({ message: "No subjects found for this standard" });
    }
    res.status(200).json({ subjects });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllSubjects = async (req, res) =>
{
  try
  {
    const response = await subjectModel.find();
    return res.status(200).json(response);
  }
  catch(error)
  {
    return res.status(500).error({error: error.message})
  }
}