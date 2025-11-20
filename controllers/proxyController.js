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
    const proxies = await proxy.find();
    res.json(proxies);
  } catch (err) {
    console.error("Error in getProxies:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};
