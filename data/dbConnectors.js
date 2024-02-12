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


// Define the schema for Shift
const shiftSchema = new mongoose.Schema({
    brief: String,
    date: Date,
    commence: String,
    conclusion: String,
    actualEndTime: String,
    coverage: [staffSchema]
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
    supervisingStaff: [staffSchema],
    casualStaff: [staffSchema],
    available: {
        type: Boolean,
        default: true
    },
    shifts: [shiftSchema],
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
const Campaigns = mongoose.model("campaigns", campaignSchema);
const Staff = mongoose.model("staffs", staffSchema);
const Shifts = mongoose.model("shifts", shiftSchema);
// Export both models
module.exports = { Campaigns, Staff, Shifts };
