const { Campaigns } = require("./dbConnectors");

const resolvers = {
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