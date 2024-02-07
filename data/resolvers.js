const { Campaigns } = require("./dbConnectors");
import { GraphQLScalarType, Kind } from 'graphql';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime(); // Convert outgoing Date to integer for JSON
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object');
  },
  parseValue(value) {
    if (typeof value === 'number') {
      return new Date(value); // Convert incoming integer to Date
    }
    throw new Error('GraphQL Date Scalar parser expected a `number`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      // Convert hard-coded AST string to integer and then to Date
      return new Date(parseInt(ast.value, 10));
    }
    // Invalid hard-coded value (not an integer)
    return null;
  },
});
const resolvers = {
    Date: dateScalar,
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
        }
    },
    Mutation: {
        createCampaign: ({ input }) => {
            const newCampaign = new Campaigns({
                name: input.name,
                description: input.description,
                thumbnail: input.thumbnail,
                department: input.department,
                supervisingStaff: input.supervisingStaff,
                casualStaff: input.casualStaff,
                available: input.available,
                shifts: input.shifts,
                postedDate: input.postedDate,
                updatedAt: input.updatedAt
            });
            newCampaign.id = newCampaign._id;

            // Save directly through promise
            return newCampaign.save()
                .then((savedCampaign) => savedCampaign)
                .catch((err) => {
                    throw err; // throw the error to be caught in the promise chain
                });
        }
    }
}


module.exports = resolvers;