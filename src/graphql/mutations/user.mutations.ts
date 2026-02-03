import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation ($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      gmail
      password
      language
      familyId
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation ($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
      id
      role
    }
  }
`;

export const UPDATE_USER_CURRENCY = gql`
  mutation ($input: UpdateUserCurrencyInput!) {
    updateUserCurrency(input: $input) {
      id
      constCurrency
    }
  }
`;

export const UPDATE_USER_LANGUAGE = gql`
  mutation ($input: UpdateUserLanguageInput!) {
    updateUserLanguage(input: $input) {
      id
      language
    }
  }
`;

export const UPDATE_USER_COLOR_THEME = gql`
  mutation ($input: UpdateUserColorThemeInput!) {
    updateUserColorTheme(input: $input) {
      id
      colorTheme
    }
  }
`;

export const UPDATE_USER_NAME = gql`
  mutation ($input: UpdateUserNameInput!) {
    updateUserName(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_USER_PASSWORD = gql`
  mutation ($input: UpdateUserPasswordInput!) {
    updateUserPassword(input: $input) {
      id
    }
  }
`;
export const LEAVE_FAMILY = gql`
  mutation LeaveFamily($userId: ID!) {
    leaveFamily(userId: $userId) {
      id
      name
      family {
        id
        name
      }
    }
  }
`;

export const UPDATE_USER_NOTIFICATION = gql`
  mutation ($input: UpdateUserNotificationInput!) {
    updateUserNotification(input: $input) {
      id
      notification
    }
  }
`;

export const UPDATE_USER_SUBNOTIFICATION = gql`
  mutation UpdateUserSubNotification($input: UpdateUserSubNotificationInput!) {
    updateUserSubNotification(input: $input) {
      id
      notifyCalendar
      notifyShopList
      notifyHomeDuty
      notifyExpenses
    }
  }
`;

export const UPDATE_USER_IMAGE = gql`
  mutation ($input: UpdateUserImageInput!) {
    updateUserImage(input: $input) {
      id
      imageUrl
    }
  }
`;

export const DELETE_USER = gql`
  mutation ($input: DeleteUserInput!) {
    deleteUser(input: $input) {
      id
      name
      gmail
    }
  }
`;
