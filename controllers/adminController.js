const Admin = require('../models/loginModel')
const bcrypt = require('bcryptjs');
exports.Login = async (req, res) =>
{

    try
    {
        const {username, password} = req.body;
        const admin = await Admin.findOne({username})
        if(!admin)
            return res.status(404).json({error:'no admin found with this username'})
        const isMatch = await bcrypt.compare(password, admin.password)
        if(!isMatch) 
            return res.status(400).json({error:'incorrect password'})
        return res.status(200).json({message:'login successful'})
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json({error:'internal server error'})
    }
}
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