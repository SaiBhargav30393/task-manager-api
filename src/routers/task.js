const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks',auth, async(req, res)=>{
    //const task=new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    } catch(e){
        res.status(400).send(error)
    }
})

router.get('/tasks/:id',auth, async(req, res)=>{
    const _id = req.params.id
    try{
        //const task = await Task.findById(_id)
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send({});
        }
        res.status(200).send(task)
    }catch(e){
        res.status(500).send(e);
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks',auth,async(req, res)=>{
    const match ={}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1:1
    }
    try{
        //const tasks = await Task.find({owner: req.user._id})
        await req.user.populate({
            path:'task',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.status(200).send(req.user.task)
    } catch(e){
        res.status(500).send(e.message)
    }
})

router.patch('/tasks/:id',auth,async(req, res)=>{
    const allowedUpdates= ['description','completed']
    const feilds = Object.keys(req.body)
    const invalidOperations = feilds.every((feild)=>{
        return allowedUpdates.includes(feild)
    })
    if(!invalidOperations){
        return res.status(400).send({'error':'Invalid Updates!'})
    }
    try{
        const task = await Task.findOne({_id:req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        feilds.forEach((feild)=>{
            task[feild]= req.body[feild]
        })
        await task.save()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id',auth, async(req, res)=>{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router