export const typeDefs = `#graphql
  scalar Json
  enum Role {
    ADMIN
    LEADER
    MEMBER
  }
  
  enum Priority {
    HIGH
    NORMAL
    LOW
  }

  enum RecurrencePattern {
    ONE_TIME
    DAILY
    WEEKLY
    MONTHLY
    YEARLY
  }
  
  enum Currency {
    USD
    EUR
    CZK
  }

  enum ExpenseCategory {
    FOOD
    BILLS
    ENTERTAINMENT
    TRANSPORT
    HEALTH
    SHOPPING
    OTHER
  }
  
  enum ShopListCategory {
    FOOD
    CLOTHES
    ENTERTAINMENT
    HEALTH
    HOUSE
    OTHER
  }

  type Family {
    id: ID!
    name: String!
    members: [User!]!
    calendars: [Calendar!]!
    shopLists: [ShopList!]!
    homeDuties: [HomeDuty!]!
    expenses: [Expense!]!
  }

  type User {
    id: ID!
    name: String!
    gmail: String!
    password: String
    provider: String
    role: Role!
    colorTheme: String
    language: String
    constCurrency: Currency!
    notification: Boolean
    notifyCalendar: Boolean
    notifyShopList: Boolean
    notifyHomeDuty: Boolean
    notifyExpenses: Boolean
    family: Family
    imageUrl: String
    pushSubscription: Json
    familyId: ID
    calendars: [Calendar!]!
    shopLists: [ShopList!]!
    homeDuties: [HomeDuty!]!
    expenses: [Expense!]!
  }

  type Calendar {
    id: ID!
    name: String!
    dateTimeStart: String!
    dateTimeEnd: String!
    description: String
    recurrence: RecurrencePattern!
    priority: Priority!
    color: String
    users: [User!]!
    family: Family!
  }

  type ShopList {
    id: ID!
    name: String!
    description: String
    quantity: Int
    priority: Priority 
    category: ShopListCategory
    users: [User!]!
    family: Family!
  }

  type HomeDuty {
    id: ID!
    name: String!
    description: String
    assignTo: String
    dueTo: String
    users: [User!]!
    family: Family!
    recurrence: RecurrencePattern!
    
  }

  type Expense {
    id: ID!
    name: String!   
    amount: Float!
    currency: Currency!
    date: String!
    note: String
    category: ExpenseCategory!
    user: User!
    family: Family!
  }

  input CreateFamilyInput {
    name: String!
    userId: ID!
  }

  input UpdateUserFamilyInput {
    userId: ID!
    familyId: ID!
  }
  
  input UpdateUserImageInput {
    userId: ID!
    imageUrl: String!
  }

  input JoinFamilyInput {
    userId: ID!
    familyId: ID!
  }

  input CreateUserInput {
    name: String!
    gmail: String!
    password: String
    provider: String
    familyId: ID
    role: Role
    language: String
  }

  input CreateCalendarInput {
    id: String
    familyId: ID!
    name: String!
    dateTimeStart: String!
    dateTimeEnd: String!
    description: String
    recurrence: RecurrencePattern!
    priority: Priority!
    color: String
    userIds: [ID!]!
  }

  input UpdateCalendarInput {
    id: ID!
    name: String
    dateTimeStart: String
    dateTimeEnd: String
    description: String
    recurrence: RecurrencePattern
    priority: Priority
    color: String
  }

  input CreateShopListInput {
    id: String
    familyId: ID!
    name: String!
    description: String
    quantity: Int
    priority: Priority 
    category: ShopListCategory
    userIds: [ID!]!
  }

  input UpdateShopListInput {
    id: ID!
    name: String
    description: String
    quantity: Int
    priority: Priority 
    category: ShopListCategory
    userIds: [ID!]
  }

  input CreateHomeDutyInput {
    id: String
    familyId: ID!
    name: String!
    description: String
    assignTo: String
    dueTo: String
    userIds: [ID!]!
    recurrence: RecurrencePattern
  }

  input UpdateHomeDutyInput {
    id: ID!
    name: String
    description: String
    assignTo: String
    dueTo: String
    recurrence: RecurrencePattern
    userIds: [ID!]
  }

  input CreateExpenseInput {
    id: String
    familyId: ID!
    name: String!   
    userId: ID!
    amount: Float!
    currency: Currency!
    date: String!
    note: String
    category: ExpenseCategory!
  }

  input UpdateExpenseInput {
    id: ID!
    name: String
    amount: Float
    currency: Currency 
    date: String
    note: String
    category: ExpenseCategory
  }

  input UpdateUserRoleInput {
    userId: ID!
    role: Role!
  }
  
  input UpdateUserCurrencyInput {
    userId: ID!
    constCurrency: Currency!
  }
  
  input UpdateUserColorThemeInput {
    userId: ID!
    colorTheme: String!
  }
  
  input DeleteUserInput {
    id: ID!
  }
  
  input UpdateUserNotificationInput {
    userId: ID!
    notification: Boolean!
  }
  
  input UpdateUserSubNotificationInput {
    userId: ID!
    notifyCalendar: Boolean
    notifyShopList: Boolean
    notifyHomeDuty: Boolean
    notifyExpenses: Boolean
}
  
  input UpdateUserNameInput {
    userId: ID!
    name: String!
  }
  
  input UpdateUserPasswordInput {
    userId: ID!
    oldPassword: String!
    newPassword: String!
  }
  
  input UpdateUserLanguageInput {
    userId: ID!
    language: String!
  }

  type Query {
    families: [Family!]!
    family(id: ID!): Family
    familyByUserId(userId: ID!): Family

    users: [User!]!
    user(gmail: String!): User
    userByGmail(gmail: String!): User

    calendars(familyId: ID!): [Calendar!]!
    calendar(id: ID!): Calendar

    shopLists(familyId: ID!): [ShopList!]!
    shopList(id: ID!): ShopList

    homeDuties(familyId: ID!): [HomeDuty!]!
    homeDuty(id: ID!): HomeDuty

    expenses(familyId: ID!): [Expense!]!
    expense(id: ID!): Expense
  }

  type Mutation {
    createFamily(input: CreateFamilyInput!): Family!
    joinFamily(input: JoinFamilyInput!): User!
    createUser(input: CreateUserInput!): User!
    updateUserRole(input: UpdateUserRoleInput!): User!
    updateUserColorTheme(input: UpdateUserColorThemeInput!): User!
    updateUserNotification(input: UpdateUserNotificationInput!): User!
    updateUserSubNotification(input: UpdateUserSubNotificationInput!): User!
    updateUserCurrency(input: UpdateUserCurrencyInput!): User!
    updateUserLanguage(input: UpdateUserLanguageInput!): User!
    updateUserFamily(input: UpdateUserFamilyInput!): User!
    updateUserImage(input: UpdateUserImageInput!): User!
    updateUserName(input: UpdateUserNameInput!): User!
    updateUserPassword(input: UpdateUserPasswordInput!): User!
    deleteUser(input: DeleteUserInput!): User!
    leaveFamily(userId: ID!): User!

    createCalendar(input: CreateCalendarInput!): Calendar!
    updateCalendar(input: UpdateCalendarInput!): Calendar!
    deleteCalendar(id: ID!): Calendar!

    createShopList(input: CreateShopListInput!): ShopList!
    updateShopList(input: UpdateShopListInput!): ShopList!
    deleteShopList(id: ID!): ShopList!

    createHomeDuty(input: CreateHomeDutyInput!): HomeDuty!
    updateHomeDuty(input: UpdateHomeDutyInput!): HomeDuty!
    deleteHomeDuty(id: ID!): HomeDuty!

    createExpense(input: CreateExpenseInput!): Expense!
    updateExpense(input: UpdateExpenseInput!): Expense!
    deleteExpense(id: ID!): Expense!
  }
`;
