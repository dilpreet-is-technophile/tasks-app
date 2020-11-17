const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
// User data entering system

//creating schema
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true
    },
    email:{
        type: String,
        unique:true,
        required:true,
        trim: true,
        lowercase:true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password" ')
            }
        }
    },
    age: {
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('Age must be positive number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            require:true
        }
    }]
})

//refrence to the tasks
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

// hiding private data
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

//function to generate token
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},'jattdamukabla')
    
    user.tokens = user.tokens.concat({token: token})
    await user.save()

    return token
}

// function to check if email exist
userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    //if we found email, checking the password 
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}
//hashing the password before saving
userSchema.pre('save',async function(next){
    const user=this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

//delete user tasks when user is removed
userSchema.pre('remove',async function (next){
    const user = this
    await Task.deletemany({owner: user._id})
    next()
})


//creating model using schema
const User=mongoose.model('User',userSchema)

module.exports = User