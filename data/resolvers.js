// Imports both models from dbConnectors
const { Campaigns, Staff, Shifts, Applications } = require("./dbConnectors"); //Now includes applications as well
const { GraphQLScalarType, Kind } = require('graphql');
const mongoose = require("mongoose");

// Function to convert 12-hour format to 24-hour format
function convertTo24Hour(time) {
  // Ensure the input is a string
  if (typeof time !== 'string') {
    console.error('Time input is not a string:', time);
    return null; // or a default value, depending on your requirements
  }

  // Attempt to split the time string into components
  let parts = time.match(/(\d+)(?::(\d\d))?\s*(AM|PM)?/i);
  if (!parts) {
    console.error('Time input format is incorrect:', time);
    return null; // or a default value
  }

  let hours = parseInt(parts[1], 10);
  let modifier = parts[3]; // AM or PM

  // If time is in PM and hours < 12, convert to 24-hour format by adding 12
  if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) {
    hours += 12;
  } else if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) {
    // If time is 12AM, convert to 0 hours for 24-hour format
    hours = 0;
  }

  return hours;
}

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date, a custom scalar type that identifies a date in the format DD/MM/YYYY',

  // Serialize Date to a value for JSON
  serialize(value) {
    if (value instanceof Date) {
      const day = String(value.getDate()).padStart(2, '0');
      const month = String(value.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const year = value.getFullYear();
      return `${day}/${month}/${year}`;
    }
    throw new Error('GraphQL Date Scalar serializer expected a `Date` object');
  },

  // Parse a value from a string to Date
  parseValue(value) {
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    throw new Error('GraphQL Date Scalar parser expected a `string` in format DD/MM/YYYY');
  },
});

module.exports = DateScalar;
/**
 * The resolver function, it defines all resolvers for the index.js file
 */
const resolvers = {
  Date: DateScalar,
  Query: {
    getCampaign: ({ id }) => {
      return Campaigns.findById(id).exec()
        .then(campaign => campaign)
        .catch(err => {
          throw err;
        });
    },
    getShift: async (_, { id }) => {
      try {
        const shift = await Shifts.findById(id)
        .populate({
          path: 'applications',
          populate: { path: 'casualWorker supervisors' }
        })
        .exec();
         // Convert IDs to strings
         shift.applications.forEach(application => {
          application.casualWorker.id = application.casualWorker._id.toString();
          application.supervisors.forEach(supervisor => {
            supervisor.id = supervisor._id.toString(); // Convert _id directly to string
          });
        });
        if (!shift) {
          throw new Error("Shift not found");
        }
        else{
          console.log(`found ${shift}`);
        }
        return shift;
      } catch (err) {
        throw err;
      }
    },
    getShiftByReference: async (_, { reference }) => { // using '_,' as no parent object is expected
      try {
        //populate the shift with applications, casualStaff and supervisors
        const shift = await Shifts.findOne({ reference })
          .populate({
            path: 'applications',
            populate: { path: 'casualWorker supervisors' }
          })
          .exec();
        // Convert IDs to strings
        shift.applications.forEach(application => {
          application.casualWorker.id = application.casualWorker._id.toString();
          application.supervisors.forEach(supervisor => {
            supervisor.id = supervisor._id.toString(); // Convert _id directly to string
          });
        });
        console.log(`found shift ${shift}`);
        return shift;
      } catch (err) {
        throw err;
      }
    },
    getAllShifts: async (_) => {
      // Fetch all shifts with populated applications
      const shifts = await Shifts.find({}).populate({
          path: 'applications',
          populate: { path: 'casualWorker supervisors approvedBySupervisor' }
      }).exec();
  
      // Convert IDs to strings for each application, in each shift
      shifts.forEach(shift => {
          shift.applications.forEach(application => {
              application.casualWorker.id = application.casualWorker._id.toString();
              application.supervisors.forEach(supervisor => {
                  supervisor.id = supervisor._id.toString();
              });
              application.approvedBySupervisor.forEach(approvingSupervisor =>{
                approvingSupervisor.id = approvingSupervisor._id.toString();
              })
          });
      });
  
      return shifts;
  },
    getAllCampaigns: () => {
      return Campaigns.find({}).exec()
        .then(campaigns => {
          return campaigns;
        })
        .catch(err => {
          throw err;
        });
    },
    getStaffByName: async (_, { name }) => {
      try {
        if (!name) {
          throw new Error('Name parameter is missing.');
        }
        //Find staff by the name
        const staff = await Staff.find({ name: name }).exec();
        return staff; // Return the found staff which could be an empty array
      } catch (error) {
        console.error('Error fetching staff by name:', error);
        throw error; // Re-throw the error to be handled by Apollo Server
      }
    },
    getAllSupervisors: async (_, { supervisor }) => {
      try {
        if (!supervisor) {
          throw new Error('Supervisor parameter is missing although required');
        }
        const super_staff = await Staff.find({ supervisor: supervisor }).exec();
        return super_staff; //return found staff
      } catch (err) {
        console.error("error fetching supervising staff ", err);
        throw error;
      }
    },
    getStaffByPersonalDetails: async (_, { name, surname }) => {
      try {
        if (!name || !surname) {
          throw new Error('Name and/or surname parameter is missing although required');
        }
        const specificStaff = await Staff.findOne({ name: name, surname: surname }).exec();

        // Check if specificStaff is null or undefined, and handle appropriately
        if (!specificStaff) {
          // return a response for the case where specificStaff is null or undefined
          throw new Error('Staff not found');
        }

        return specificStaff; // Return found staff
      } catch (err) {
        console.error("Error fetching specific staff ", err);
        throw err;
      }
    },
    getAllStaff: () => {
      return Staff.find({}).exec()
        .then(staff => {
          return staff;
        })
        .catch(err => {
          throw err;
        });
    },
  },
  Mutation: {
    //Mutation TO BE UPDATED
    createCampaign: async ({ input }) => {
      //casual staff was omitted  as it's "calculated by a separated function"
      const newCampaign = new Campaigns({
        name: input.name,
        description: input.description,
        thumbnail: input.thumbnail,
        campaignType: input.campaignType,
        department: input.department,
        //supervisingStaff: input.supervisingStaff,
        available: input.available,
        //shifts: input.shifts,
        postedDate: input.postedDate,
        endDate: input.endDate,
        updatedAt: input.updatedAt
      });
      //set a field called id with the value of _id which is the mongodb automatically assigned id
      newCampaign.id = newCampaign._id.toString();
      //the following code until the campaign save might cause errors, in that case, just remove it
      if (input.shifts && input.shifts.length > 0) {
        input.shifts.forEach(shiftInput => {
          //set Shifts fields on shiftInput
          const newShift = new Shifts({
            brief: shiftInput.brief,
            date: shiftInput.date,
            commence: shiftInput.commence,
            conclusion: shiftInput.conclusion,
            actualEndTime: shiftInput.actualEndTime,
            coverage: shiftInput.coverage
          })
          newShift.id = newShift._id;
          newCampaign.shifts.push(newShift);
        })
      }
      // Handle staff if provided
      if (input.supervisingStaff && input.supervisingStaff.length > 0) {
        // supervisingStaff is an array of staff IDs
        const staffIds = input.supervisingStaff;

        // Find existing staff members by ID
        const existingStaff = await Staff.find({ _id: { $in: staffIds } });

        // Add existing staff members to the campaign
        newCampaign.supervisingStaff = existingStaff;
      }

      // Save directly through promise
      return newCampaign.save()
        .then((savedCampaign) => savedCampaign)
        .catch((err) => {
          throw err; // throw the error to be caught in the promise chain
        });
    },
    addStaff: async (_, { input }) => {
      try {
        const { name, surname, photo, biography, supervisor, mainDepartment, casualWorkDepartments, contacts } = input;

        // Create a new Staff object
        const newStaff = new Staff({
          name,
          surname,
          photo,
          biography,
          supervisor,
          mainDepartment,
          casualWorkDepartments,
          contacts
        });
        // manually save staff ID to not cause discrepancies
        newStaff.id = newStaff._id.toString();
        // Save new staff to the database directly through promise
        const savedStaff = await newStaff.save();
        // debug to see saved staff
        console.log('New staff saved:', savedStaff);
        // further debug to check discrepancies
        console.log(`the staff id is ${savedStaff.id}, the staff _id is ${savedStaff._id}`);
        return savedStaff;
      } catch (err) {
        console.error('Error adding staff:', err);
        throw new Error(`Failed to add staff: ${err.message}`);
      }
    },
    createShift: async (_, { input }) => {
      try {
        const { reference, name, brief, date, commence, conclusion, actualEndTime, deadLine ,createdBy} = input;
        const todaysDate = new Date();
        // Create a new Shifts instance
        const newShift = new Shifts({
          name,
          reference,
          brief,
          date,
          commence,
          conclusion,
          actualEndTime,
          deadLine,
          createdBy
        });
        //manually store the Id to not cause discrepancies later on
        newShift.id = newShift._id.toString();
        
        // set Status
        if(deadLine > todaysDate){
          newShift.status = "OPEN";
        }else{
          newShift.status = "CLOSED";
        }

        // Save the new shift
        const savedShift = await newShift.save();

        console.log("Saved Shift: ", savedShift);

        return savedShift;
      } catch (err) {
        console.error('Error adding shift:', err);
        throw new Error(`Failed to add shift: ${err.message}`);
      }
    },
    createApplication: async (_, { shiftId, casualWorkerId, supervisorsIds, input }) => {
      try {
        //try to find the Shift
        const shift = await Shifts.findById(shiftId);
        if (!shift) {
          throw new Error("shift wasn't found");
        }

        //find the casual staff by ID
        const casualStaff = await Staff.findById(casualWorkerId);
        if (!casualStaff) {
          throw new Error("Casual staff not found");
        }

        //find approving staffs
        const supervisors = await Staff.find({ _id: { $in: supervisorsIds } });
        if (supervisors.length !== supervisorsIds.length) {
          const notFoundIds = supervisorsIds.filter(id => !supervisors.find(staff => staff._id.equals(id)));
          throw new Error(`Approving staff with IDs ${notFoundIds.join(', ')} not found`);
        }

        //Create the application instance
        const application = new Applications({
          casualWorker: casualStaff,
          supervisors: supervisors,
          applicationStatus: input.applicationStatus
        });
        //if casual worker / staff added a comment or reason behind the application creation and or update
        if(input.comment){
          application.comment = input.comment;
        }
        if(input.turndownReason){
          application.turndownReason = input.turndownReason;
        }
        //manually store the id to avoid later discrepancies
        application.id = application._id.toString();

        // Update the shift with the new application ID (one to many relation)
        shift.applications.push(application._id);

        // Increment the totalApplications count
        shift.totalApplications++;

        // Save the shift and application 
        await shift.save();
        await application.save();

        // Populate the created application before returning
        await application.populate('casualWorker supervisors approvedBySupervisor');

        // Return the populated application to view on the screen
        return application;
      } catch (error) {
        //if an error is found instantly
        throw new Error(`failed to create an application with error: ${error.message}`);
      }
    },
    updateApplicationStatus: async (_, { input }) => {
      try {
        const { id, applicationStatus } = input;

        // 1: Find the application by ID
        const application = await Applications.findById(id);

        // 2: Check if the application exists
        if (!application) {
          throw new Error("Application not found");
        }

        // 3: Update the application status
        application.applicationStatus = applicationStatus;
        await application.save();

        // 4. Return the updated application
        return application;
      } catch (error) {
        throw new Error(`Failed to update application: ${error.message}`);
      }
    },
    updateShiftsStatus: async (_) => {
      try {
        const shifts = await Shifts.find({}).populate({
          path: 'applications',
          populate: { path: 'casualWorker supervisors approvedBySupervisor' }
        }).exec();
        const currentHour = new Date().getHours(); // Gets the current hour in 24-hour format
    
        shifts.forEach(async (shift) => {
          // Convert commence and conclusion times to 24-hour format
          const commenceHour = convertTo24Hour(shift.commence);
          const conclusionHour = convertTo24Hour(shift.conclusion);
    
          // Current date and shift date for comparison
          const currentDate = new Date(new Date().toDateString());
          const shiftDate = new Date(shift.date.toDateString());
          const deadlineDate = new Date(shift.deadLine.toDateString()); // Make sure to define deadlineDate
          console.log({
            currentDate, shiftDate, deadlineDate, commenceHour, conclusionHour, currentHour
          });
          
          // Check if today's date matches the shift date
          if (currentDate.getTime() === shiftDate.getTime()) {
            // It's the day of the shift
            
            if (currentHour >= commenceHour && currentHour < conclusionHour) {
              shift.status = "COMMENCING";
            } else if (currentHour >= conclusionHour) {
              shift.status = "CONCLUDED";
            }
          } else if (currentDate > shiftDate) {
            // It's after the shift date
            shift.status = "CONCLUDED";
          } else if (currentDate > deadlineDate) {
            // It's past the deadline but before the shift date
            if (shift.status !== "CONCLUDED") {
              shift.status = "CLOSED";
            }
          } else {
            // It's before the deadline
            if (shift.status !== "CONCLUDED" && shift.status !== "CLOSED") {
              shift.status = "OPEN";
            }
          }
    
          await shift.save();
        });
    
        return shifts; // Return the updated list of shifts
      } catch (error) {
        throw new Error(`Failed to update shift statuses: ${error.message}`);
      }
    },
    updateAllShiftStatuses: async () => {
      try {
        const shifts = await Shifts.find({}).populate({
          path: 'applications',
          populate: { path: 'casualWorker supervisors approvedBySupervisor' }
        }).exec();
        const currentHour = new Date().getHours(); // Gets the current hour in 24-hour format
  
        shifts.forEach((shift) => {
          // Logic to update shift status
          const commenceHour = convertTo24Hour(shift.commence);
          const conclusionHour = convertTo24Hour(shift.conclusion);
          const currentDate = new Date(new Date().toDateString());
          const shiftDate = new Date(shift.date.toDateString());
          const deadlineDate = new Date(shift.deadLine.toDateString()); // Ensure deadlineDate is defined
  
          if (currentDate.getTime() === shiftDate.getTime()) {
            if (currentHour >= commenceHour && currentHour < conclusionHour) {
              shift.status = "COMMENCING";
            } else if (currentHour >= conclusionHour) {
              shift.status = "CONCLUDED";
            } else {
              shift.status = "CLOSED";
            }
          } else {
            if (currentDate > deadlineDate && currentDate < shiftDate) {
              shift.status = "CLOSED";
            } else if (currentDate > shiftDate) {
              shift.status = "CONCLUDED";
            } else {
              shift.status = "OPEN";
            }
          }
  
          // Note: Not awaiting here, fire and forget for now
          shift.save().catch(err => console.error(`Error saving shift ${shift._id}:`, err));
        });
  
        // Since we're not awaiting the saves, just return true immediately
        return true;
      } catch (error) {
        console.error(`Failed to update shift statuses: ${error.message}`);
        return false; // Indicate failure
      }
    }
      
    //modify campaign also updates the updatedAt automatically to current date (view GetUkDate)
  }
}


module.exports = resolvers;