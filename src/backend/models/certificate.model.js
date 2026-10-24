import mongoose from 'mongoose'

const certificateSchema = new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },
    activityName:{
        type:String,
        required:true,
        trim:true
    },
    category:{
        type:String,
        required:true
    },
    certificateUrl: {
            type: String,
            required: true
    },
    certificateId:{
        type:String,
        trim:true,
        default:""
    },
    extractedtext:{
        type:String,
        default:""
    },
    fileHash:{
        type:String,
        required:true
    },
    verificationStatus:{
        type:String,
        enum:["Pending",
                "Approved",
                "Rejected",
                "Duplicate Suspected"
            ],
        default:"Pending"
    },
    duplicateOf:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Certificate"
    },
    aiConfidence: {
            type: Number,
            min: 0,
            max: 1,
            default: null
    },

    pointsAwarded: {
        type: Number,
        min: 0,
        default: 0
    }
},{timestamps:true})

const Certificate= mongoose.model("Certificate", certificateSchema)

export default Certificate