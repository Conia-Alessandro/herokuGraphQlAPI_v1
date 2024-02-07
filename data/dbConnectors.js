const mongoose = require("mongoose");

// Function to get current UK time
const getUKTime = () => {
    const now = new Date();
    const ukOffset = 60; // UTC+0 is UK time
    now.setMinutes(now.getMinutes() + ukOffset);
    return now;
};

// MongoDB connection URL
const MONGODB_URI = 'mongodb://127.0.0.1/campaigns';

// MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

// Establish MongoDB connection
mongoose.connect(MONGODB_URI, mongooseOptions)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Define the schema for Staff
const staffSchema = new mongoose.Schema({
    id: String,
    name: String,
    photo: String,
    biography: String,
    supervisor: Boolean,
    departments: [String],
    contacts: [{
        type: String,
        value: String,
        preferredTime: String
    }]
});

// Define the schema for Shift
const shiftSchema = new mongoose.Schema({
    id: String,
    brief: String,
    date: String,
    time: String,
    endTime: String,
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
    department: {
        type: String,
        enum: ['AMBASSADORS', 'HELPERS', 'MENTORS']
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
        default: getUKTime
    },
    updatedAt: Date
});

// Define the model
const Campaigns = mongoose.model("campaigns", campaignSchema);
//export the model
module.exports = Campaigns;

