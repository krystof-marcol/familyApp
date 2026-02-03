import { gql } from "@apollo/client";

export const GET_FAMILIES = gql`
  query {
    families {
      id
      name
      members {
        id
        name
      }
    }
  }
`;

export const GET_FAMILY = gql`
  query ($id: ID!) {
    family(id: $id) {
      id
      name
      members {
        id
        name
      }
      calendars {
        id
        name
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
`;

export const GET_FAMILY_BY_USERID = gql`
  query GetFamilyByUserId($userId: ID!) {
    familyByUserId(userId: $userId) {
      id
      name
      members {
        id
        name
        role
        imageUrl
      }
      calendars {
        id
        name
        dateTimeStart
        dateTimeEnd
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
        category
      }
    }
  }
`;
