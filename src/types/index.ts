import {
  RecurrenceType,
  PriorityType,
  ExpenseCategory,
  Role,
} from "@prisma/client";

export type Calendar = {
  id: string;
  name: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  description?: string;
  recurrence: RecurrenceType;
  priority: PriorityType;
  users?: User[];
  familyId: string;
};

export type ShopList = {
  id: string;
  name: string;
  description?: string;
  users?: User[];
  familyId: string;
};

export type HomeDuty = {
  id: string;
  name: string;
  description?: string;
  recurrence: RecurrenceType;
  users?: User[];
  familyId: string;
};

export type Expense = {
  id: string;
  amount: number;
  currency: string;
  dateTime: string;
  note?: string;
  category: ExpenseCategory;
  userId: string;
  familyId: string;
};

export type Family = {
  id: string;
  name: string;
  members?: User[];
  calendars?: Calendar[];
  shopLists?: ShopList[];
  homeDuties?: HomeDuty[];
  expenses?: Expense[];
};

export type User = {
  id: string;
  name: string;
  gmail: string;
  password?: string | null;
  provider?: string | null;
  imageUrl?: string | null;
  role: Role;
  family?: Family;
  familyId?: string | null;

  Calendar?: Calendar[];
  ShopList?: ShopList[];
  HomeDuty?: HomeDuty[];
  Expense?: Expense[];
};
