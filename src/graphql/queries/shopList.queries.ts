import { gql } from "@apollo/client";

export const GET_SHOPLISTS = gql`
  query ($familyId: ID!) {
    shopLists(familyId: $familyId) {
      id
      name
      description
      priority
      category
      quantity
      users {
        id
        name
      }
    }
  }
`;

export const GET_SHOPLIST = gql`
  query ($id: ID!) {
    shopList(id: $id) {
      id
      name
      description
      users {
        id
        name
      }
    }
  }
`;
