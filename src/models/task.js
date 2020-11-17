const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')


//making user schema
const taskSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed: {
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
}) 


//making model from schema
const Task = mongoose.model('Task',taskSchema)

module.exports = Task