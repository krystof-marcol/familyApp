import { gql } from "@apollo/client";

export const CREATE_EXPENSE = gql`
  mutation ($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      id
      name
      amount
      currency
      date
      note
      category
    }
  }
`;

export const UPDATE_EXPENSE = gql`
  mutation ($input: UpdateExpenseInput!) {
    updateExpense(input: $input) {
      id
      amount
    }
  }
`;

export const DELETE_EXPENSE = gql`
  mutation ($id: ID!) {
    deleteExpense(id: $id) {
      id
    }
  }
`;
