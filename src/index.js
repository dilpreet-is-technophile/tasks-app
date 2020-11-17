const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
 
const app = express()

//setting up port, one is for heroku other for localhost
const port = process.env.port || 3000

//this will parse all the json data to objects
app.use(express.json())

//registering our routers
app.use(userRouter)
app.use(taskRouter)


//listening to the port
app.listen(port,()=>{
    console.log('server is up on port '+ port)
})

