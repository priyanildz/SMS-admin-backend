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













// const vehicleModel = require("../models/vehicleModel");
// const driverModel = require("../models/driverModel")
// // exports.addVehicle = async (req, res) => {
// //   try {
// //     // req.body now contains the document URLs and new fields
// //     const vehicle = new vehicleModel(req.body);
// //     await vehicle.save()
// //     return res.status(200).json({ message: "added vehicle successfully" });
// //   } catch (error) {
// //     // The error will now include validation errors for the new required fields
// //     return res.status(500).json({ error: error.message });
// //   }
// // };
// exports.addVehicle = async (req, res) => {
//   try {
//     // req.body now contains ONLY the basic vehicle details
//     const vehicle = new vehicleModel(req.body);
//     await vehicle.save()
//     return res.status(200).json({ message: "added vehicle successfully" });
//   } catch (error) {
//     // The error will now include validation errors for the original required fields only
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

// // exports.updateVehicle = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const updatedData = req.body; 
// //     const vehicle = await vehicleModel.findByIdAndUpdate(id, updatedData, { new: true });
// //     if (!vehicle) {
// //       return res.status(404).json({ message: "Vehicle not found" });
// //     }
// //     return res.status(200).json({ message: "Vehicle updated successfully", vehicle });
// //   } catch (error) {
// //     return res.status(500).json({ error: error.message });
// //   }
// // };


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

exports.addVehicle = async (req, res) => {
  try {
    // req.body now contains ONLY the basic vehicle details
    const vehicle = new vehicleModel(req.body);
    await vehicle.save()
    return res.status(200).json({ message: "added vehicle successfully" });
  } catch (error) {
    // The error will now include validation errors for the original required fields only
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
exports.addDriver = async (req, res) => {
  try {
    // req.body should now contain ALL fields necessary for the updated DriverSchema
    // including firstName, lastName, email, licenseNumber, completeAddress, etc.
    
    // The frontend logic sends: 
    // { vid: 'DUMMY...', driverName: 'Full Name' }
    // This will now FAIL validation against the new schema!

    // If the frontend is meant to send the FULL data (which is what you should do):
    // const driverData = { ...req.body, driverName: `${req.body.firstName} ${req.body.lastName}` };
    
    // For simplicity, we keep the controller simple and rely on the full data being present in req.body
    const driver = new driverModel(req.body);
    await driver.save()
    return res.status(200).json({ message: 'driver added successfully' })
  }
  catch (error) {
    // This will catch the Mongoose validation errors if the full data isn't provided
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
