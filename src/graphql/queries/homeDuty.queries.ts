import { gql } from "@apollo/client";

export const GET_HOMEDUTIES = gql`
  query ($familyId: ID!) {
    homeDuties(familyId: $familyId) {
      id
      name
      description
      assignTo
      dueTo
      recurrence
      users {
        id
        name
      }
    }
  }
`;

export const GET_HOMEDUTY = gql`
  query ($id: ID!) {
    homeDuty(id: $id) {
      id
      name
      description
      recurrence
      users {
        id
        name
      }
    }
  }
`;
