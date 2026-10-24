import dns from "node:dns";
import dotenv from "dotenv"
import connectDB from "../db/index.js"

import {app} from "./app.js"

dotenv.config({
    path:'./src/.env'
})

dns.setServers(["10.240.208.119"]);
connectDB()

.then(() => {
    app.on("error",(error) => {
        console.log("Error: ",error);
    })
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running in port ${process.env.PORT || 8000} `)
    })})
.catch((err) => {
    console.log("MONGO DB connection failed!!!",err)
})