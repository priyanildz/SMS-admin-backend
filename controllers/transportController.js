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
const driverModel = require("../models/driverModel");
const staffModel = require("../models/vehicleSupervisior");

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

exports.addVehicle = async (req, res) => {
  try {
    // req.body now contains the basic vehicle details PLUS the uploaded document URLs
    // e.g., req.body = { ..., vehicleno: "MH12AB1234", vehicleImageUrl: "https://...", pucUrl: "https://...", ... }
    const vehicle = new vehicleModel(req.body);
    await vehicle.save()
    return res.status(200).json({ message: "added vehicle successfully" });
  } catch (error) {
    // This will now catch validation errors for the new required URL fields if the front-end fails to upload them
    return res.status(500).json({ error: error.message });
  }
};

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


// exports.getVehicle = async (req, res) => {
//   try {
//     // The implementation for populate is complex and requires all models to be imported.
//     // For now, we will return the raw data and assume the frontend handles the names.
//     // **IMPORTANT: Your backend MUST populate this data for the frontend to show names.**
    
//     // For testing simplicity, assume 'assignedDriverId' etc. are present on the vehicle object.
//     const vehicles = await vehicleModel.find();
    
//     // --- Manual Mapping to mimic population (You need to implement population on your server) ---
//     const mappedResponse = vehicles.map(vehicle => {
//         const vehicleObj = vehicle.toObject();
//         return {
//             ...vehicleObj,
//             // These fields MUST be looked up and attached by your backend
//             assignedDriverName: vehicleObj.assignedDriverId || 'Unassigned', // Placeholder
//             assignedSupervisorName: vehicleObj.assignedSupervisorId || 'Unassigned', // Placeholder
//             assignedRoute: vehicleObj.assignedRouteId || 'No Route', // Placeholder
//             currentStudents: vehicleObj.currentStudents || 0,
//         };
//     });

//     // NOTE: If the Mongoose population is correctly configured and working, 
//     // you would return: res.status(200).json({ success: true, data: populatedVehicles });
    
//     // Using the structure the frontend expects:
//     return res.status(200).json({ success: true, data: mappedResponse });
    
//   }
//   catch (error) {
//     return res.status(500).json({ success: false, error: error.message });
//   }
// }

exports.getVehicle = async (req, res) => {
  try {
    const vehicles = await vehicleModel.find()
      .populate({
        path: 'assignedDriverId',
        select: 'driverName _id' // Select name and ID
      })
      .populate({
        path: 'assignedSupervisorId',
        select: 'fullName _id' // Select name and ID
      })
      .populate({
        path: 'assignedRouteId',
        select: 'name _id' // Assuming your Route model has a 'name' field
      })
      .lean(); // Use .lean() for efficient object manipulation

    // Map the result to flatten the names and prepare the final data structure
    const mappedResponse = vehicles.map(vehicle => {
        
        const assignedDriverName = vehicle.assignedDriverId 
                                   ? vehicle.assignedDriverId.driverName 
                                   : 'Unassigned';

        const assignedSupervisorName = vehicle.assignedSupervisorId 
                                       ? vehicle.assignedSupervisorId.fullName 
                                       : 'Unassigned';

        const assignedRouteName = vehicle.assignedRouteId 
                                  ? vehicle.assignedRouteId.name // Use .name for route
                                  : 'No Route';
        
        return {
            ...vehicle, 
            
            // Name fields (for display)
            assignedDriverName: assignedDriverName,
            assignedSupervisorName: assignedSupervisorName,
            assignedRoute: assignedRouteName,
            
            // ID fields (for passing to modal/save payload)
            assignedDriverId: vehicle.assignedDriverId ? vehicle.assignedDriverId._id : null,
            assignedSupervisorId: vehicle.assignedSupervisorId ? vehicle.assignedSupervisorId._id : null,
            assignedRouteId: vehicle.assignedRouteId ? vehicle.assignedRouteId._id : null,
            currentStudents: vehicle.currentStudents || 0,
        };
    });

    return res.status(200).json({ success: true, data: mappedResponse });
    
  }
  catch (error) {
    console.error("Vehicle Fetch Error with Population:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch vehicle list: " + error.message });
  }
}



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



exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const assignmentData = req.body; 
    
    // 1. Fetch the existing vehicle document to get required fields (URLs)
    const existingVehicle = await vehicleModel.findById(id).lean();

    if (!existingVehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    // 2. Merge assignment data with existing required fields (URLs)
    // This prevents Mongoose validation failure on required fields like vehicleImageUrl, pucUrl, etc.,
    // which are not sent from the assignment modal.
    const mergedUpdateData = {
        ...existingVehicle, // Copy existing data (including URLs)
        ...assignmentData   // Override with new assignment IDs
    };

    // 3. Perform the update with validation
    const vehicle = await vehicleModel.findByIdAndUpdate(id, mergedUpdateData, { 
        new: true,
        runValidators: true // CRITICAL: Ensures Mongoose validation runs on all required fields
    });
    
    return res.status(200).json({ success: true, message: "Vehicle updated successfully", data: vehicle });
  } catch (error) {
    console.error("Vehicle Assignment Update Error:", error);
    // Returning validation errors cleanly helps the frontend debug the payload.
    if (error.name === "ValidationError") {
        return res.status(400).json({ success: false, message: "Mongoose Validation Failed during update.", errors: error.errors });
    }
    return res.status(500).json({ success: false, message: "Error updating vehicle assignment", error: error.message });
  }
};