const { buildSchema } = require("graphql");
//might use gql instead of buildSchema
const schema = buildSchema(`
    scalar Date
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
        "the campaign type, for most common campaigns"
        campaignType: CampaignType!
        "a campaign's main department, this is used to distinguish campaigns between eachother"
        department: Department!
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
        "a campaign's end date, if present"
        endDate: Date
        "a campaign's date that signifies the last meaningful update of information"
        updatedAt: Date
    }
    """
    Enum representing all sub-department a casual worker or staff is employed into
    """
    enum SubDepartment{
        AMBASSADOR
        HELPER
        MENTOR
    }
    """
    Enum representing the department a campaign comes from
    """
    enum Department{
        MARKETING
        EVENTS
        RECRUITING
        STUDENTLIFE
        STRATEGY
    }
    """
    Enum representing different preferred times for contact
    """
    enum PreferredTimeSlot{
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
    Enum representing common types of Campaigns
    """
    enum CampaignType{
        ONCAMPUSACTIVITY
        OPENDAY
        FRESHERS
        CAMPUSTOUR
        VIRTUALTOUR
        ONLINEEVENT
        ONLINEWEBINAR
        EXAMPERIOD
        STUDYPERIOD
        HOLIDAYIN
        KEEPINTOUCH
        SOCIETIESMEETUP
        FESTIVALOFCULTURES
    }
    """
    Type representing a singular staff member
    """
    type Staff{
        id: ID!
        name: String!
        surname: String!
        photo: String
        biography: String
        supervisor: Boolean
        mainDepartment: Department
        casualWorkDepartments: [SubDepartment!]!
        contacts: [ContactInformation!]!
    }
    """
    Type representing a member of staff's contact information
    """
    type ContactInformation{
        contactType: ContactType!
        value: String!
        preferredTimeSlot: PreferredTimeSlot!
        preferredTime: String
    }
    """ 
    Type representing a shift object
    """
    type Shift{
        id: ID!
        brief: String!
        date: Date!
        commence: String!
        conclusion: String!
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
        "an operation to return the staff with specific name"
        getStaffByName(name: String!): [Staff]
        "an operation to return all staff members"
        getAllStaff: [Staff]
    }
    """
    the input type required for a mutation in contact information
    """
    input ContactInformationInput{
        contactType: ContactType!
        value: String!
        preferredTimeSlot: PreferredTimeSlot!
        preferredTime: String
    }
    """
    the input type required for a mutation in staff information
    """
    input StaffInput{
        name: String!
        surname: String!
        photo: String
        biography: String
        supervisor: Boolean
        mainDepartment: Department
        casualWorkDepartments: [SubDepartment!]!
        contacts: [ContactInformationInput!]!
    }
    """
    the input type required for a mutation in shift information
    """
    input ShiftInput{
        id: ID
        brief: String!
        date: Date!
        commence: String!
        conclusion: String!
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
        campaignType: CampaignType!
        department: Department!
        supervisingStaff: [ID!]!
        available: Boolean
        shifts: [ShiftInput!]!
        postedDate: Date
        endDate: Date!
        updatedAt: Date
    }
    """
    the mutation type, used to mutate (create/update/delete) information
    """
    type Mutation{
        "a mutation to create a new campaign"
        createCampaign(input: CampaignInput): Campaign
        "a mutation to create a new Member of staff"
        addStaff(input: StaffInput): Staff
    }
`)

module.exports = schema;