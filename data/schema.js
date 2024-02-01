const { buildSchema } = require("graphql");
const { GraphQLDate } = require('graphql-iso-date');
//might use gql instead of buildSchema

const schema = buildSchema(`
    scalar Date
    "a Single campaign object"
    type Campaign{
        "the campaign id"
        id: ID!
        "the campaign name"
        name: String!
        "a campaign description"
        description: String
        "a campaign thumbnail image"
        thumbnail: String
        "a campaign's department"
        department: Department!#
        "a campaign array's of staff"
        supervisingStaff: [Staff!]!
        casualStaff: [Staff]!
        available: Boolean
        shifts: [Shift!]!
        postedDate: Date
        updatedAt: Date
    }
    enum Department{
        AMBASSADORS
        HELPERS
        MENTORS
    }
    enum PreferredTime{
        MORNING
        AFTERNOON
        EVENING
    }
    enum ContactType{
        PHONE
        EMAIL
        WORKPHONE
        WORKEMAIL
    }
    type Staff{
        id: ID!
        name: String!
        photo: String
        biography: String
        supervisor: Boolean
        departments: [Department!]!
        contacts: [ContactInformation!]!
    }
    type ContactInformation{
        type: ContactType!
        value: String!
        preferredTime: PreferredTime!
    }
    type Shift{
        id: ID!
        brief: String!
        date: Date!
        time: String!
        endTime: String!
        actualEndTime: String
        coverage: [Staff!]!
    }
    type Query{
        getCampaign(id: ID): Campaign
        getAllCampaigns : [Campaign]
    }
    input ContactInformationInput{
        type: ContactType!
        value: String!
        preferredTime: PreferredTime!
    }
    input StaffInput{
        id: ID!
        name: String!
        photo: String
        biography: String
        supervisor: Boolean
        departments: [Department!]!
        contacts: [ContactInformation!]!
    }
    input CampaignInput{
        id: ID
        name: String!
        description: String
        thumbnail: String
        department: Department!
        supervisingStaff: [StaffInput!]!
        casualStaff: [StaffInput]!
        available: Boolean
        shifts: [Shift!]!
        postedDate: Date
        updatedAt: Date
    }
    type Mutation{
        createCampaign(input: CampaignInput): Campaign
    }
`)

module.exports = schema;