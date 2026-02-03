import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query {
    users {
      id
      name
      gmail
      password
      provider
      constCurrency
      role
      family {
        id
        name
      }
    }
  }
`;

export const GET_USER_BY_GMAIL = gql`
  query ($gmail: String!) {
    userByGmail(gmail: $gmail) {
      id
      name
      gmail
      constCurrency
      password
      familyId
    }
  }
`;

export const GET_USER = gql`
  query ($gmail: String!) {
    user(gmail: $gmail) {
      id
      name
      gmail
      role
      imageUrl
      constCurrency
      family {
        id
        name
        calendars {
          id
          name
          dateTimeStart
          dateTimeEnd
          description
          recurrence
        }
        shopLists {
          id
          name
        }
        homeDuties {
          id
          name
        }
        expenses {
          id
          amount
        }
      }
    }
  }
`;
