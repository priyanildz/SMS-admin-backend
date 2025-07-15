const User = require('../models/studentModel')
exports.createUser = async (req, res) =>{
    try
    {
        // console.log('received msg: ',req.body)
        const user = new User(req.body)
        await user.save()
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
exports.getNewStudents = async (req,res) =>{
    try {
        const students = await User.find({
            "admission.admissiondate":{
                $gte: new Date("2024-01-01")
            }
        })
        console.log(students)
        return res.status(200).send({students})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message:"Error: "+error})
    }
}