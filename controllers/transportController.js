// const vehicleModel = require("../models/vehicleModel");
// const driverModel = require("../models/driverModel")
// exports.addVehicle = async (req, res) => {
//   try {
//     const vehicle = new vehicleModel(req.body);
//     await vehicle.save()
//     return res.status(200).json({ message: "added vehicle successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };
// exports.getVehicle = async (req, res) => {
//   try {
//     const response = await vehicleModel.find();
//     return res.status(200).json(response);
//   }
//   catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// }
// exports.addDriver = async (req, res) => {
//   try {
//     const driver = new driverModel(req.body);
//     await driver.save()
//     return res.status(200).json({ message: 'driver added successfully' })
//   }
//   catch (error) {
//     return res.status(500).json({ error: error.message })
//   }
// }
// exports.getDrivers = async (req, res) => {
//   try {
//     const drivers = await driverModel.find();
//     const vehicles = await vehicleModel.find();

//     const merged = drivers.map(driver => {
//       const vehicle = vehicles.find(v => 
//         v.vehicleno?.toString() === driver.vid?.toString()
//       );

//       return {
//         ...driver.toObject(),
//         vehicles: vehicle || {} // agar vehicle na mile to empty object
//       };
//     });

//     return res.status(200).json(merged);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.updateVehicle = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedData = req.body; 
//     const vehicle = await vehicleModel.findByIdAndUpdate(id, updatedData, { new: true });
//     if (!vehicle) {
//       return res.status(404).json({ message: "Vehicle not found" });
//     }
//     return res.status(200).json({ message: "Vehicle updated successfully", vehicle });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

















const vehicleModel = require("../models/vehicleModel");
const driverModel = require("../models/driverModel")


const multer = require('multer');
const path = require('path');
const fs = require('fs'); // To delete local files after upload
const { uploadFileToCloudinary } = require('../utils/cloudinary');

const upload = multer({ dest: 'uploads/' });


exports.addVehicle = async (req, res) => {
    // 🚨 IMPORTANT: This controller expects the 'upload.fields' middleware 
    // to be placed in router.js before this function is called.
    try {
        const vehicleData = req.body;
        const files = req.files;

        // 1. Validate that all required files are present
        if (!files || !files.vehicle_docs || !files.puc || !files.insurance || !files.registration_cert) {
            return res.status(400).json({ message: "All vehicle documents (Vehicle Docs, PUC, Insurance, RC) are required." });
        }

        // 2. Upload files to Cloudinary
        const [vehicleDocResult, pucResult, insuranceResult, rcResult] = await Promise.all([
            uploadFileToCloudinary(files.vehicle_docs[0], 'vehicle_docs'),
            uploadFileToCloudinary(files.puc[0], 'vehicle_docs'),
            uploadFileToCloudinary(files.insurance[0], 'vehicle_docs'),
            uploadFileToCloudinary(files.registration_cert[0], 'vehicle_docs'),
        ]);

        // 3. Create the final vehicle object with document URLs
        const newVehicle = new vehicleModel({
            ...vehicleData,
            documents: {
                vehicle_docs: vehicleDocResult.secure_url,
                puc: pucResult.secure_url,
                insurance: insuranceResult.secure_url,
                registration_cert: rcResult.secure_url,
            },
            // Since all inputs are compulsory and we are adding 'assignedroute' in model:
            assignedroute: vehicleData.assignedroute // Ensure this is coming from req.body
        });
        
        // 4. Save to MongoDB
        await newVehicle.save();

        // 5. Clean up local files (optional but recommended)
        Object.values(files).flat().forEach(file => {
            if (file.path) {
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Error deleting local file:", err);
                });
            }
        });

        return res.status(200).json({ message: "Vehicle registered successfully" });
    } catch (error) {
        console.error("Error in addVehicle:", error);
        return res.status(500).json({ error: error.message });
    }
};





exports.getVehicle = async (req, res) => {
  try {
    const response = await vehicleModel.find();
    return res.status(200).json(response);
  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
exports.addDriver = async (req, res) => {
  try {
    const driver = new driverModel(req.body);
    await driver.save()
    return res.status(200).json({ message: 'driver added successfully' })
  }
  catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await driverModel.find();
    const vehicles = await vehicleModel.find();

    const merged = drivers.map(driver => {
      const vehicle = vehicles.find(v => 
        v.vehicleno?.toString() === driver.vid?.toString()
      );

      return {
        ...driver.toObject(),
        vehicles: vehicle || {} // agar vehicle na mile to empty object
      };
    });

    return res.status(200).json(merged);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body; 
    const vehicle = await vehicleModel.findByIdAndUpdate(id, updatedData, { new: true });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    return res.status(200).json({ message: "Vehicle updated successfully", vehicle });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

