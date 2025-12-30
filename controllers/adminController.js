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
        const { subject, body, date, username } = req.body;

        // You can create a new 'AdminLeave' model or add a 'role' field to a shared Leave model
        const newLeave = new AdminLeave({
            username, // Link it to the admin who is logged in
            subject,
            body,
            date,
            status: "Pending"
        });

        await newLeave.save();
        return res.status(200).json({ message: "Admin leave applied successfully" });
    } catch (error) {
        console.error("Admin Leave Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};