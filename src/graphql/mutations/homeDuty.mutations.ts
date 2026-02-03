import { gql } from "@apollo/client";

export const CREATE_HOMEDUTY = gql`
  mutation ($input: CreateHomeDutyInput!) {
    createHomeDuty(input: $input) {
      id
      name
      description
      assignTo
      dueTo
      recurrence
    }
  }
`;

export const UPDATE_HOMEDUTY = gql`
  mutation ($input: UpdateHomeDutyInput!) {
    updateHomeDuty(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_HOMEDUTY = gql`
  mutation ($id: ID!) {
    deleteHomeDuty(id: $id) {
      id
    }
  }
`;
