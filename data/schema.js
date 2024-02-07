const { buildSchema } = require("graphql");
//might use gql instead of buildSchema

const schema = buildSchema(`
    """
    A Single campaign object
    """
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
        "a campaign's array of supervising staff"
        supervisingStaff: [Staff!]!
        "a campaign's array of casual working force"
        casualStaff: [Staff]!
        "a campaign's availability, by default true"
        available: Boolean
        "a campaign's array of shifts"
        shifts: [Shift!]!
        "a campaign's posted date, by default today's date"
        postedDate: Date
        "a campaign's date that signifies the last meaningful update of information"
        updatedAt: Date
    }
    """
    Enum representing different departments
    """
    enum Department{
        AMBASSADORS
        HELPERS
        MENTORS
    }
    """
    Enum representing different preferred times for contact
    """
    enum PreferredTime{
        MORNING
        AFTERNOON
        EVENING
    }
    """
    Enum representing different contact types
    """
    enum ContactType{
        PHONE
        EMAIL
        WORKPHONE
        WORKEMAIL
    }
    """
    Type representing a singular staff member
    """
    type Staff{
        id: ID!
        name: String!
        photo: String
        biography: String
        supervisor: Boolean
        departments: [Department!]!
        contacts: [ContactInformation!]!
    }
    """
    Type representing a member of staff's contact information
    """
    type ContactInformation{
        type: ContactType!
        value: String!
        preferredTime: PreferredTime!
    }
    """ 
    Type representing a shift object
    """
    type Shift{
        id: ID!
        brief: String!
        date: Date!
        time: String!
        endTime: String!
        actualEndTime: String
        coverage: [Staff!]!
    }
    """
    The query type, used to retrieve data
    """
    type Query{
        "an operation to return a specific campaign object, requires its ID"
        getCampaign(id: ID): Campaign
        "an operation to return all campaign objects present"
        getAllCampaigns: [Campaign]
    }
    """
    the input type required for a mutation in contact information
    """
    input ContactInformationInput{
        type: ContactType!
        value: String!
        preferredTime: PreferredTime!
    }
    """
    the input type required for a mutation in staff information
    """
    input StaffInput{
        id: ID!
        name: String!
        photo: String
        biography: String
        supervisor: Boolean
        departments: [Department!]!
        contacts: [ContactInformationInput!]!
    }
    """
    the input type required for a mutation in shift information
    """
    input ShiftInput{
        id: ID
        brief: String!
        date: String!
        time: String!
        endTime: String!
        actualEndTime: String
        coverage: [StaffInput!]!
    }
    """
    the input type for a mutation in a campaign
    """
    input CampaignInput{
        id: ID
        name: String!
        description: String
        thumbnail: String
        department: Department!
        supervisingStaff: [StaffInput!]!
        casualStaff: [StaffInput]!
        available: Boolean
        shifts: [ShiftInput!]!
        postedDate: Date
        updatedAt: Date
    }
    """
    the mutation type, used to mutate (create/update/delete) information
    """
    type Mutation{
        createCampaign(input: CampaignInput): Campaign
    }
`)

module.exports = schema;