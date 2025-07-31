const assessment = require('../models/assessmentModel')
const homework = require('../models/homeworkModel')
exports.addAssessment = async(req, res) =>
{
    try
    {
        const response = new assessment(req.body);
        await response.save()
        return res.status(200).json({message:'assessment added successfully'})
    }
    catch(error)
    {
        console.error(error)
        return res.status(500).json({error: error.message})
    }
}