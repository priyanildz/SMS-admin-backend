// const Route = require("../models/routeModel");
// const vehicle = require("../models/vehicleModel");
// const driver = require("../models/driverModel");
// const studentAssign = require("../models/studentTransport");

// exports.addRoute = async (req, res) => {
//   try {
//     const response = new Route(req.body);
//     await response.save();
//     return res.status(200).json({ message: "route added successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.getRoutes = async (req, res) => {
//   try {
//     const routes = await Route.find();
//     const vehicles = await vehicle.find();
//     const drivers = await driver.find();

//     const merged = routes.map((route) => {
//       const vehicleInfo = vehicles.find(
//         (v) => v.vehicleno === route.vehicleNumber
//       );
//       const driverInfo = drivers.find((v) => v.vid === vehicleInfo.vid);
//       return {
//         ...route.toObject(),
//         vehicle: vehicleInfo || null,
//         driverr: driverInfo || null,
//       };
//     });

//     return res.status(200).json(merged);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.assignStudent = async (req, res) => {
//   try {
//     const response = new studentAssign(req.body);
//     await response.save();
//     return res
//       .status(200)
//       .json({ message: "student assigned to route successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// exports.getAssignedStudents = async (req, res) => {
//   try {
//     const response = await studentAssign.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };









// routeController.js (Updated)

const Route = require("../models/routeModel");
const vehicle = require("../models/vehicleModel");
const driver = require("../models/driverModel");
const studentAssign = require("../models/studentTransport");

exports.addRoute = async (req, res) => {
  try {
    const response = new Route(req.body);
    await response.save();
    // Return the created route data, including the new _id, for the frontend to use in the PUT update
    return res.status(200).json({ success: true, message: "route added successfully", data: response });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    const vehicles = await vehicle.find();
    // Drivers model is no longer needed here, as the frontend uses the main vehicle list for staff lookup.

    const merged = routes.map((route) => {
      const routeObj = route.toObject();
      
      // Find the vehicle assigned to this route number
      const vehicleInfo = vehicles.find(
        (v) => v.vehicleno === routeObj.vehicleNumber
      );
      
      return {
        ...routeObj,
        // Attach the entire found vehicle object to the route for reference
        vehicle: vehicleInfo || null,
        // We remove the problematic "driverr" field that was always null
        // driverr: driverInfo || null, 
      };
    });

    return res.status(200).json(merged);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.assignStudent = async (req, res) => {
  try {
    const response = new studentAssign(req.body);
    await response.save();
    return res
      .status(200)
      .json({ message: "student assigned to route successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAssignedStudents = async (req, res) => {
  try {
    const response = await studentAssign.find();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


exports.deleteRoute = async (req, res) => {
    try {
        const routeId = req.params.id;
        
        // 1. Find the route before deleting it to get the routeName
        const routeToDelete = await Route.findById(routeId);
        if (!routeToDelete) {
            return res.status(404).json({ success: false, message: "Route not found" });
        }

        // 2. Perform the actual route deletion
        await Route.findByIdAndDelete(routeId);

        // 3. CLEANUP: Find the vehicle that referenced this route ID and unassign it
        // We use the route's vehicleNumber field for the lookup if assignedRouteId on vehicle is not used.
        // A more robust way is to find the vehicle where assignedRouteId matches routeId.
        
        // Find the vehicle by its internal route ID reference:
        const unassignedVehicle = await vehicle.findOneAndUpdate(
            { assignedRouteId: routeId },
            { $set: { assignedRouteId: null } },
            { new: true }
        );

        if (unassignedVehicle) {
            console.log(`Vehicle ${unassignedVehicle.vehicleno} unassigned from route: ${routeToDelete.routeName}`);
        }

        return res.status(200).json({ success: true, message: "Route deleted and vehicle unassigned successfully" });
    } catch (error) {
        console.error("Route Deletion Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};