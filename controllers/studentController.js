const User = require('../models/studentModel')
exports.createUser = async (req, res) =>{
    try
    {
        console.log('received msg: ',req.body)
        const user = new User(req.body)
        const saved = await user.save()
        res.status(200).json({message:'student created'})
    }
    catch(error)
    {
        console.error(error)
        res.status(500).json({error:error.message})
    }
}
exports.getStudents = async (req, res) =>
{
    try
    {
        const students = await User.find()
        res.status(200).json(students)
    }
    catch(error)
    {
        res.status(500).json({error:error.message})
    }
}