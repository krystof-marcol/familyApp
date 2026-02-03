import { gql } from "@apollo/client";

export const GET_EXPENSES_BY_FAMILY = gql`
  query ($familyId: ID!) {
    expenses(familyId: $familyId) {
      id
      name
      amount
      currency
      date
      note
      category
      user {
        id
        name
      }
    }
  }
`;

export const GET_EXPENSES_BY_USER = gql`
  query ($userId: ID!) {
    expenses(userId: $userId) {
      id
      name
      amount
      currency
      date
      note
      category
      family {
        id
        name
      }
    }
  }
`;

export const GET_EXPENSE = gql`
  query ($id: ID!) {
    expense(id: $id) {
      id
      amount
      currency
      dateTime
      note
      category
      user {
        id
        name
      }
    }
  }
`;
