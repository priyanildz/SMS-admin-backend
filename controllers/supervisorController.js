import transportSupervisor from "../models/transportSupervisor";
exports.addSupervisor = async (req, res) => {
    try {
        const response = await transportSupervisor.create(req.body);
        res.status(200).json({ message: "Supervisor added successfully", data: response });
    } catch (error) {
        res.status(500).json({ message: "Error adding supervisor", error: error.message });
    }
};
exports.getAllSupervisors = async (req, res) => {
    try {
        const supervisors = await transportSupervisor.find();
        res.status(200).json({ data: supervisors });
    } catch (error) {
        res.status(500).json({ message: "Error fetching supervisors", error: error.message });
    }
};