const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router =new express.Router()

//creating user route
router.post('/users',async (req,res)=>{
    const user = new User(req.body)
    try {
        await user.save()
        //calling function to generate token
        const token = await user.generateAuthToken()
        
        res.status(201).send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//logging in user
router.post('/users/login',async (req,res)=>{
    try {
        // calling function that will check if email exist
        const user = await User.findByCredentials(req.body.email, req.body.password)
        //calling function to generate token
        const token = await user.generateAuthToken()

        res.send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

//logout route
router.post('/users/logout',auth,async (req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// logging out from all sessions
router.post('/users/logoutAll',auth,async (req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//user profile
router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})


//updating our user by id
router.patch('/users/me', auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if(!isValidOperation){
        return res.status(400).send({error:'Invalid Updates'})
    }
    try {
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send()
    }
})
//deleting user
router.delete('/users/me',auth,async (req,res)=>{
    try {
        const user = await User.findByIdAndDelete(req.user._id)
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

//exporting the module
module.exports = router