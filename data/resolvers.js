// Imports both models from dbConnectors
const { Campaigns, Staff, Shifts } = require("./dbConnectors");
const { GraphQLScalarType, Kind } = require('graphql');

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date, a custom scalar type that identifies a date in the format DD/MM/YYYY',

  // Serialize Date to a value for JSON
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime(); // Convert outgoing Date to integer for JSON
    }
    throw new Error('GraphQL Date Scalar serializer expected a `Date` object');
  },

  // Parse a value from an integer to Date
  parseValue(value) {
    if (typeof value === 'number') {
      return new Date(value); // Convert incoming integer to Date
    }
    throw new Error('GraphQL Date Scalar parser expected a `number`');
  },

  // Parse a literal string to a Date
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const dateValue = ast.value; // Extract the string value from the AST
      const parts = dateValue.split('/');

      if (parts.length !== 3) {
        throw new Error('Invalid date format. Expected format: DD/MM/YYYY');
      }

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are zero-indexed in JS
      const year = parseInt(parts[2], 10);

      const parsedDate = new Date(year, month, day);

      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format. Expected format: DD/MM/YYYY');
      }

      return parsedDate;
    }

    throw new Error('GraphQL Date Scalar parser expected a `string`');
  },
});
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
    getAllCampaigns: () => {
      return Campaigns.find({}).exec()
        .then(campaigns => {
          return campaigns;
        })
        .catch(err => {
          throw err;
        });
    },
    getStaffByName: ({ name }) => {
      if (!name) {
        throw new Error('Name parameter is missing.');
      }
      console.log("name: ",name);
      return Staff.find({ name: name }).exec()
        .then(staff => {
          return staff;
        })
        .catch(err => {
          throw err;
        });
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
      newCampaign.id = newCampaign._id;
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
  
          // Save new staff to the database directly through promise
          const savedStaff = await newStaff.save();
          console.log('New staff saved:', savedStaff);
          return savedStaff;
      } catch (err) {
          console.error('Error adding staff:', err);
          throw new Error(`Failed to add staff: ${err.message}`);
      }
  }
    
    //modify campaign also updates the updatedAt automatically to current date (view GetUkDate)
  }
}


module.exports = resolvers;