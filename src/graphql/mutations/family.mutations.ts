import { gql } from "@apollo/client";

export const CREATE_FAMILY = gql`
  mutation ($input: CreateFamilyInput!) {
    createFamily(input: $input) {
      id
      name
    }
  }
`;

export const JOIN_FAMILY = gql`
  mutation ($input: JoinFamilyInput!) {
    joinFamily(input: $input) {
      id
      name
      role
    }
  }
`;

export const UPDATE_USER_FAMILY = gql`
  mutation ($input: UpdateUserFamilyInput!) {
    updateUserFamily(input: $input) {
      id
      familyId
    }
  }
`;
