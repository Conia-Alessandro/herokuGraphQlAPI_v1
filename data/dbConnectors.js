const mongoose = require("mongoose");
require('dotenv').config();
// Function to get current UK time
const getUKTime = (offset) => {
    const now = new Date();
    const ukOffset = 60; // UTC+0 is UK time
    now.setMinutes(now.getMinutes() + ukOffset);
    now.setDate(now.getDate() + offset);
    return now;
};

// MongoDB connection URL (now an URL)
//const MONGODB_URI = 'mongodb://127.0.0.1/campaigns';

//the staff schema
const staffSchema = new mongoose.Schema({
    name: String,
    surname: String,
    photo: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Missing_photo.svg"
    },
    biography: {
        type: String,
        default: `A worker in ${process.env.INSTITUTIONNAME}`
    },
    supervisor: {
        type: Boolean,
        default: false
    },
    mainDepartment:{
        type: String,
        enum: ['MARKETING', 'EVENTS', 'RECRUITING', 'STUDENTLIFE', 'STRATEGY']
    },
    casualWorkDepartments: [{
        type: String,
        enum: ['AMBASSADOR', 'HELPER', 'MENTOR']
    }],
    contacts: [{
        contactType: String,
        value: String,
        preferredTimeSlot: {
            type: String,
            enum: ["MORNING", "AFTERNOON", "EVENING"]
        },
        preferredTime: String
    }]
});
// Define the schema for a Shift Application

const applicationSchema = new mongoose.Schema({
    casualWorker : { type: mongoose.Schema.Types.ObjectId , ref: 'staffs'}, //references to staff
    supervisors: [{type: mongoose.Schema.Types.ObjectId , ref: 'staffs'}], //references an array of staff
    applicationStatus: {
        type: String,
        enum: ["OPEN","OFFERED","APPLIED","PENDING","ASSIGNED","REJECTED","TURNEDDOWN","CLOSED"]
    },
    appliedAt:{
        type:Date,
        default: getUKTime(0)
    },
    turndownReason:{
        type: String,
        default: ""
    },
    comment:{
        type: String,
        default: ""
    },
    approvedBySupervisor: [{type: mongoose.Schema.Types.ObjectId , ref: 'staffs'}]
})

// Define the schema for Shift
const shiftSchema = new mongoose.Schema({
    status:{
        type: String,
        enum: ["OPEN","COMMENCING","CLOSED", "CONCLUDED"],
        default: "OPEN"
    },
    reference: String,
    name: String,
    brief: String,
    date: Date,
    commence: String,
    conclusion: String,
    actualEndTime: String,
    applications: [{type:mongoose.Schema.Types.ObjectId , ref: 'applications'}], // References to Application instead of direct storing
    totalApplications:{
        type: Number,
        default: 0
    },
    postedAt:{
        type:Date,
        default: getUKTime(0)
    },
    deadLine:{
        type:Date,
        default: getUKTime(7) //defaults to a week
    },
    createdBy: String
});


// Define the schema for Campaign
const campaignSchema = new mongoose.Schema({
    name: String,
    description: {
        type: String,
        default: "A Campaign with a set of available shifts"
    },
    thumbnail: {
        type: String,
        default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII='
    },
    campaignType: {
        type: String,
        enum: ['MARKETING', 'EVENTS', 'RECRUITING', 'STUDENTLIFE', 'STRATEGY']
    },
    department: {
        type: String,
        enum: ['ONCAMPUSACTIVITY', 'OPENDAY', 'FRESHERS', 'CAMPUSTOUR', 'VIRTUALTOUR', 'ONLINEEVENT', 'ONLINEWEBINAR', 'EXAMPERIOD', 'STUDYPERIOD', 'HOLIDAYIN', 'KEEPINTOUCH', 'SOCIETIESMEETUP', 'FESTIVALOFCULTURES']
    },
    supervisingStaff: [{ type: mongoose.Schema.Types.ObjectId , ref: 'staffs'}], //references to staff instead of directly storing it
    casualStaff: [{ type: mongoose.Schema.Types.ObjectId , ref: 'staffs'}], //references to staff instead of directly storing it
    available: {
        type: Boolean,
        default: true
    },
    shifts: [{ type: mongoose.Schema.Types.ObjectId , ref: 'shifts'}], //references to Shifts instead of directly storing it [shiftSchema]
    postedDate: {
        type: Date,
        default: getUKTime(0)
    },
    endDate: {
        type: Date,
        default: getUKTime(1)
    },
    updatedAt: Date
});

// Define the model
const Applications = mongoose.model("applications",applicationSchema);
const Campaigns = mongoose.model("campaigns", campaignSchema);
const Staff = mongoose.model("staffs", staffSchema);
const Shifts = mongoose.model("shifts", shiftSchema);

//Debug the models
console.log(mongoose.models)

// Export both models
module.exports = { Campaigns, Staff, Shifts, Applications };
