const envFile = process.env.NODE_ENV === 'production' ? '../.env' : '../.env.development';
require('dotenv').config({ path: __dirname + '/' + envFile });

const express=require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app =express()
const port= process.env.PORT
// when API request is fired the request gets parsed here
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port,()=>{
    console.log('server is up on port '+port)
})

