import { gql } from "@apollo/client";

export const GET_CALENDARS = gql`
  query ($familyId: ID!) {
    calendars(familyId: $familyId) {
      id
      name
      dateTimeStart
      dateTimeEnd
      description
      recurrence
      priority
      color
      users {
        id
        name
      }
    }
  }
`;

export const GET_CALENDAR = gql`
  query ($id: ID!) {
    calendar(id: $id) {
      id
      name
      dateTimeStart
      dateTimeEnd
      description
      recurrence
      priority
      color
      users {
        id
        name
      }
    }
  }
`;
