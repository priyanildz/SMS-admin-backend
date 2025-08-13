const SyllabusTracker = require("../models/classesSyllabusTrackerModel")

exports.getCurrentSyllabus = async(req,res) =>{
    try {
        const data = await SyllabusTracker.find();

        if(!data || data.length === 0){
            return res.status(404).send({message: 'No data found!'})
        }
        return res.status(200).send(data)
    } catch (error) {
        console.log(error)
        return res.status(500).send({message: 'Got an error: '+error})
    }
}

exports.addSyllabus = async (req , res) =>{
    try {
        const {std , div, class_teacher, subject, pending, total} = req.body;

        if(!std || !div || !class_teacher || !subject || !pending || !total){
            return res.status(400).send({message: 'Bad request, please provide complete data'})
        }
        const newSyllabus = new SyllabusTracker({
            std,
            div,
            class_teacher,
            subject,
            pending,
            total
        })
        await newSyllabus.save()
        return res.status(201).send(newSyllabus)
    } catch (error) {
        console.log("Error: "+error)
        return res.status(500).send({ message: 'Error found: '+error})
    }
}