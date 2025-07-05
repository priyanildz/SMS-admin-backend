const User = require('../models/studentModel')
exports.createUser = async (req, res) =>{
    try
    {
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