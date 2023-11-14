const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendDeleteEmail} = require('../emails/account')

const router = new express.Router()

// Sign up
router.post('/users',async(req, res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthtoken()
        res.send({user, token})
    } catch(e){
        res.status(400).send(e.message)
    }
})

//Log in
router.post('/users/login', async(req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthtoken()
        res.send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})

//logout
router.post('/users/logout',auth,async(req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll',auth,async(req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})

//profile
router.get('/users/me',auth,async(req, res)=>{
    res.send(req.user)
})

router.patch('/user/me',auth, async(req, res)=>{
    const allowedUpdates = ['name','email','password','age']
    const updates = Object.keys(req.body) //to convert body to array with keys as values
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if(!isValidOperation){
        res.status(400).send({error: 'Invalid updates!'}) 
    }
    try{
        //const user = await User.findByIdAndUpdate(req.params.id, req.body,{new:true, runValidators: true})
            //const user = await User.findById(req.params.id)
            updates.forEach((update)=>{
                req.user[update]= req.body[update]
            })
            await req.user.save()
        res.send(req.user)
    } catch(e){
        res.status(400).send(e.message)
    }
})

router.delete('/users/me', auth, async(req, res)=>{
    try{
        await Task.deleteMany({owner:req.user._id})
        await User.deleteOne({_id:req.user._id})
        sendDeleteEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
           return cb(new Error('Please upload image'))
        }
        cb(undefined, true)
    }
   })
   
router.post('/users/me/avatar',auth, upload.single('avatar'), async(req,res)=>{
    //req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save() 
    res.send("Image uploaded Successfully")
},(error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar',auth, async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send("Image deleted Successfully")
})

router.get('/users/:id/avatar',async(req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports = router