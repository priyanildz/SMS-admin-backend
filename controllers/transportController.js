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















// const vehicleModel = require("../models/vehicleModel");
// const driverModel = require("../models/driverModel")

// // exports.addVehicle = async (req, res) => {
// //   try {
// //     // req.body now contains ONLY the basic vehicle details
// //     const vehicle = new vehicleModel(req.body);
// //     await vehicle.save()
// //     return res.status(200).json({ message: "added vehicle successfully" });
// //   } catch (error) {
// //     // The error will now include validation errors for the original required fields only
// //     return res.status(500).json({ error: error.message });
// //   }
// // };

// exports.addVehicle = async (req, res) => {
//   try {
//     // req.body now contains the basic vehicle details PLUS the uploaded document URLs
//     // e.g., req.body = { ..., vehicleno: "MH12AB1234", vehicleImageUrl: "https://...", pucUrl: "https://...", ... }
//     const vehicle = new vehicleModel(req.body);
//     await vehicle.save()
//     return res.status(200).json({ message: "added vehicle successfully" });
//   } catch (error) {
//     // This will now catch validation errors for the new required URL fields if the front-end fails to upload them
//     return res.status(500).json({ error: error.message });
//   }
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
// // exports.addDriver = async (req, res) => {
// //   try {
// //     const driver = new driverModel(req.body);
// //     await driver.save()
// //     return res.status(200).json({ message: 'driver added successfully' })
// //   }
// //   catch (error) {
// //     return res.status(500).json({ error: error.message })
// //   }
// // }
// exports.addDriver = async (req, res) => {
//   try {
//     // req.body should now contain ALL fields necessary for the updated DriverSchema
//     // including firstName, lastName, email, licenseNumber, completeAddress, etc.
    
//     // The frontend logic sends: 
//     // { vid: 'DUMMY...', driverName: 'Full Name' }
//     // This will now FAIL validation against the new schema!

//     // If the frontend is meant to send the FULL data (which is what you should do):
//     // const driverData = { ...req.body, driverName: `${req.body.firstName} ${req.body.lastName}` };
    
//     // For simplicity, we keep the controller simple and rely on the full data being present in req.body
//     const driver = new driverModel(req.body);
//     await driver.save()
//     return res.status(200).json({ message: 'driver added successfully' })
//   }
//   catch (error) {
//     // This will catch the Mongoose validation errors if the full data isn't provided
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
const driverModel = require("../models/driverModel");
const staffModel = require("../models/vehicleSupervisior"); 
// Assuming you have a route model imported here, e.g.:
// const routeModel = require("../models/routeModel"); 
// Since Route model is not fully provided, we will assume it's available.

// ... (exports.addVehicle, exports.addDriver, exports.getDrivers)

/**
 * GET ALL VEHICLES (Now includes populated Driver/Supervisor names)
 */
exports.getVehicle = async (req, res) => {
  try {
    // 1. Fetch vehicles and populate related documents by their IDs
    const response = await vehicleModel.find()
      .populate({
        path: 'assignedDriverId',
        select: 'driverName' // Fetch driver's full name
      })
      .populate({
        path: 'assignedSupervisorId',
        select: 'fullName' // Fetch supervisor's full name
      })
      .populate({
        path: 'assignedRouteId',
        select: 'routeName' // Assuming Route model has a 'routeName' field
      });
      
    // 2. Map the result to flatten the names into fields the frontend uses
    const mappedResponse = response.map(vehicle => {
        const vehicleObj = vehicle.toObject();
        return {
            ...vehicleObj,
            
            // Driver: Use populated name or default string
            assignedDriverName: vehicleObj.assignedDriverId ? vehicleObj.assignedDriverId.driverName : 'Unassigned',
            
            // Supervisor: Use populated name or default string
            assignedSupervisorName: vehicleObj.assignedSupervisorId ? vehicleObj.assignedSupervisorId.fullName : 'Unassigned',
            
            // Route: Use populated route name or default string
            assignedRoute: vehicleObj.assignedRouteId ? vehicleObj.assignedRouteId.routeName : 'No Route',
            
            // Other fields (for completeness in the response, even if not displayed)
            currentStudents: vehicleObj.currentStudents || 0,
        };
    });

    return res.status(200).json({ success: true, data: mappedResponse });

  } catch (error) {
    console.error("Error populating vehicle data:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch vehicle assignments with names." });
  }
}

/**
 * UPDATE VEHICLE (Handles Assignment Save from Modal)
 */
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body; 
    
    // Perform the update using findByIdAndUpdate
    // Mongoose will automatically cast the assigned IDs to ObjectId type if they are valid 24-char hex strings.
    const vehicle = await vehicleModel.findByIdAndUpdate(id, updatedData, { 
        new: true,
        runValidators: true // Ensures required fields (like document URLs) are handled
    });
    
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    
    return res.status(200).json({ success: true, message: "Vehicle updated successfully", data: vehicle });
  } catch (error) {
    console.error("Vehicle Assignment Update Error:", error);
    
    // Log validation errors explicitly to help debug required fields issues
    if (error.name === "ValidationError") {
        return res.status(400).json({ success: false, message: "Validation failed during update.", errors: error.errors });
    }
    // Handle the CastError (ObjectId fail) that occurred in the previous step
    if (error.name === "CastError" && error.kind === "ObjectId") {
        return res.status(400).json({ success: false, message: `Invalid ID provided for assignment: ${error.value}` });
    }

    return res.status(500).json({ success: false, message: "Error updating vehicle assignment", error: error.message });
  }
};