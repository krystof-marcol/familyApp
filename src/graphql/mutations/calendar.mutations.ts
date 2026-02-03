import { gql } from "@apollo/client";

export const CREATE_CALENDAR = gql`
  mutation ($input: CreateCalendarInput!) {
    createCalendar(input: $input) {
      id
      name
      dateTimeStart
      dateTimeEnd
      description
      color
    }
  }
`;

export const UPDATE_CALENDAR = gql`
  mutation ($input: UpdateCalendarInput!) {
    updateCalendar(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_CALENDAR = gql`
  mutation ($id: ID!) {
    deleteCalendar(id: $id) {
      id
    }
  }
`;
