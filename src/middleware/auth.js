const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next)=>{
  
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, 'jattdamukabla')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token':token })

        if(!user){
            throw new Error()
        }

        // so that we logout of that particular token only
        req.token = token

        //sending info of the user we found in data
        req.user = user
        next()

    } catch (e) {
        res.status(401).send({error: 'please authenticate'})
    }

}

module.exports = auth