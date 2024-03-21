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
    Enum representing the shift Status
    recently changed to
    "OPEN","APPLIED","PENDING","ASSIGNED", "REJECTED" , "CLOSED" , "TURNEDDOWN"
    """
    enum ApplicationStatus{
        OFFERED
        APPLIED
        PENDING
        ASSIGNED
        REJECTED
        TURNEDDOWN
    }
    """
    Type representing a Shift application between the casual worker and his supervisor
    """
    type Application{
        "the application id"
        id: ID!
        "the casual worker applied / to apply"
        casualWorker: Staff
        "the Staff responsible to approve , has to be at least one person"
        supervisors: [Staff!]!
        "the status of the application, an Enum with different values"
        applicationStatus: ApplicationStatus!
        "The date of the application, subject to change with each application"
        appliedAt: Date
        "The reason for turndown of the shift"
        turndownReason : String
        "any additional comment made for the shift application"
        comment: String
        "The staff that approved the application, has to be the same as approving staff"
        approvedBySupervisor: [Staff!]!
    }
    """
    An Enum representing the shift status, a shift could either be OPEN or CLOSED depending on the deadline date.
    """
    enum ShiftStatus{
        OPEN
        CLOSED
    }
    """ 
    Type representing a shift object
    """
    type Shift{
        id: ID!
        status: ShiftStatus
        reference: String!
        brief: String!
        date: Date!
        commence: String!
        conclusion: String!
        "the actual end time of the shift, this is used in retrospection"
        actualEndTime: String
        "The list of applications made for that shift"
        applications: [Application!]!
        "the total number of applications, the number is determined by applications"
        totalApplications: Int
        "the date of which the shift was created"
        postedAt: Date
        "the deadline for all shift applications"
        deadLine: Date
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
        "an operation to find a specific member of staff"
        getStaffByPersonalDetails(name: String!, surname: String!): Staff
        "an operation to return all supervising staff"
        getAllSupervisors(supervisor: Boolean): [Staff]
        "an operation to return all staff members"
        getAllStaff: [Staff]
        "an operation to return a shift by id"
        getShift(id: ID): Shift
        "an operation to return all shifts"
        getAllShifts: [Shift]
        "an operation to return a shift by its unique reference name"
        getShiftByReference(reference: String): Shift
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
        reference: String
        brief: String!
        date: Date!
        commence: String!
        conclusion: String!
        actualEndTime: String
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
    This input specifically refers to a shift being added at any time that doesn't need hard coded staff coverage. Hence why it's removal
    """
    input addShiftInput{
        id: ID
        reference: String!
        brief: String!
        date: Date!
        commence: String!
        conclusion: String!
        actualEndTime: String
        deadLine: Date
    }
    """
    The application input
    """
    input ApplicationInput{
        id: ID
        applicationStatus: ApplicationStatus!
        comment: String
        reason: String
    }
    """
    the mutation type, used to mutate (create/update/delete) information
    """
    type Mutation{
        "a mutation to create a new campaign"
        createCampaign(input: CampaignInput): Campaign
        "a mutation to create a new Member of staff"
        addStaff(input: StaffInput): Staff
        "a mutation to create a shift"
        createShift(input: addShiftInput) : Shift
        "creates an Application for a shift , in resolvers"
        createApplication(shiftId: ID!, casualWorkerId:ID!, supervisorsIds:[ID!]!, input: ApplicationInput!): Application
        "updates the application's status"
        updateApplicationStatus(input: ApplicationInput!): Application
    }
`)

module.exports = schema;