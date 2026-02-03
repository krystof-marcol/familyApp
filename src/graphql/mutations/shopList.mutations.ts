import { gql } from "@apollo/client";

export const CREATE_SHOPLIST = gql`
  mutation ($input: CreateShopListInput!) {
    createShopList(input: $input) {
      id
      name
      description
      quantity
    }
  }
`;

export const UPDATE_SHOPLIST = gql`
  mutation ($input: UpdateShopListInput!) {
    updateShopList(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_SHOPLIST = gql`
  mutation ($id: ID!) {
    deleteShopList(id: $id) {
      id
    }
  }
`;
