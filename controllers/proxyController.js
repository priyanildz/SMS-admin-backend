// const proxy = require("../models/proxyModel");

// // Create a new proxy entry
// exports.createProxy = async (req, res) => {
//   try {
//     const newProxy = new proxy(req.body);
//     const savedProxy = await newProxy.save();
//     res.status(201).json(savedProxy);
//   } catch (err) {
//     console.error("Error in createProxy:", err);
//     res.status(500).json({
//       error: err.message,
//     });
//   }
// };

// // Get all proxy entries
// exports.getProxies = async (req, res) => {
//   try {
//     const proxies = await proxy.find();
//     res.json(proxies);
//   } catch (err) {
//     console.error("Error in getProxies:", err);
//     res.status(500).json({
//       error: err.message,
//     });
//   }
// };

const proxy = require("../models/proxyModel");

// Create a new proxy entry
exports.createProxy = async (req, res) => {
  try {
    const newProxy = new proxy(req.body);
    const savedProxy = await newProxy.save();
    res.status(201).json(savedProxy);
  } catch (err) {
    console.error("Error in createProxy:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// Get all proxy entries
exports.getProxies = async (req, res) => {
  try {
    const proxies = await proxy.find()
      .populate("fromteacher", "firstname lastname")
      .populate("toteacher", "firstname lastname");

    res.json(proxies);
  } catch (err) {
    console.error("Error in getProxies:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// Delete a proxy entry
exports.deleteProxy = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProxy = await proxy.findByIdAndDelete(id);

        if (!deletedProxy) {
            return res.status(404).json({ message: "Proxy entry not found." });
        }

        res.status(200).json({ message: "Proxy deleted successfully." });
    } catch (err) {
        console.error("Error in deleteProxy:", err);
        res.status(500).json({
            error: err.message,
        });
    }
};