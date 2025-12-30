const Admin = require('../models/loginModel')
const bcrypt = require('bcryptjs');
// exports.Login = async (req, res) =>
// {

//     try
//     {
//         const {username, password} = req.body;
//         const admin = await Admin.findOne({username})
//         if(!admin)
//             return res.status(404).json({error:'no admin found with this username'})
//         const isMatch = await bcrypt.compare(password, admin.password)
//         if(!isMatch) 
//             return res.status(400).json({error:'incorrect password'})
//         return res.status(200).json({message:'login successful'})
//     }
//     catch(error)
//     {
//         console.log(error)
//         return res.status(500).json({error:'internal server error'})
//     }
// }

exports.Login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(404).json({ error: 'no admin found' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ error: 'incorrect password' });

        // FIX: Return the username and a placeholder token (or real JWT if you use one)
        return res.status(200).json({ 
            message: 'login successful',
            username: admin.username, // Needed for ProfileScreen
            token: "ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU=" // Your static token
        });
    } catch (error) {
        return res.status(500).json({ error: 'internal server error' });
    }
};



exports.Register = async (req, res) =>
{
    try
    {
        const {username} = req.body;
        const exists = await Admin.findOne({username})
        if(exists)
            return res.status(400).json({error:'account already exists'})

        const admin = new Admin(req.body);
        const saved = await admin.save()
        return res.status(200).json({message:'admin created successfully'})
    }
    catch(error)
    {
        return res.status(500).json({error:error.message})
    }
}
exports.getAdminProfile = async (req, res) => {
    try {
        // In a real app, you'd get the username from a decoded JWT token.
        // For now, we'll use a query parameter or header for testing.
        const { username } = req.query; 
        const admin = await Admin.findOne({ username }).select("-password");
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        return res.status(200).json(admin);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addAdminLeave = async (req, res) => {
    try {
        const { username, subject, body, date } = req.body;
        // Logic to save to your 'admins' collection or a new 'admin_leaves' collection
        console.log(`Leave requested by ${username}`); 
        return res.status(200).json({ message: "Admin leave saved successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Database save failed" });
    }
};

exports.getAdminLeaves = async (req, res) => {
    try {
        const { username } = req.query;
        // Fetch only leaves belonging to this specific admin username
        // const leaves = await Leave.find({ username, type: "admin" });
        // res.status(200).json(leaves);
        res.status(200).json([]); // Placeholder until your model is ready
    } catch (error) {
        res.status(500).json({ error: "Error fetching admin leaves" });
    }
};