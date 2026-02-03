import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/graphql/schema";
import prisma from "@/lib/db";
import { GraphQLJSON } from "graphql-type-json";
import {
  Role,
  RecurrenceType,
  ExpenseCategory,
  PriorityType,
  ShopListCategory,
  Currency,
} from "@prisma/client";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

interface CreateFamilyInput {
  input: { name: string; userId: string };
}

interface JoinFamilyInput {
  input: { userId: string; familyId: string };
}

interface CreateUserInput {
  input: {
    name: string;
    gmail: string;
    language?: string;
    password?: string | null;
    provider?: string | null;
    pushSubscription?: JSON;
    familyId?: string | null;
    role?: Role;
  };
}

interface UpdateUserRoleInput {
  input: { userId: string; role: Role };
}
interface UpdateUserNameInput {
  input: { userId: string; name: string };
}

interface UpdateUserCurrencyInput {
  input: { userId: string; constCurrency: Currency };
}

interface UpdateUserPasswordInput {
  input: { userId: string; oldPassword: string; newPassword: string };
}

interface UpdateUserLanguageInput {
  input: { userId: string; language: string };
}

interface UpdateUserColorThemeInput {
  input: { userId: string; colorTheme: string };
}

interface UpdateUserNotificationInput {
  input: { userId: string; notification: boolean };
}

interface UpdateUserSubNotificationInput {
  input: {
    userId: string;
    notifyCalendar: boolean;
    notifyShopList: boolean;
    notifyHomeDuty: boolean;
    notifyExpenses: boolean;
  };
}

interface UpdateUserFamilyInput {
  input: { userId: string; familyId: string };
}

interface UpdateUserImageInput {
  input: { userId: string; imageUrl: string };
}

interface CreateCalendarInput {
  input: {
    id: string;
    familyId: string;
    name: string;
    dateTimeStart: string;
    dateTimeEnd: string;
    description?: string;
    recurrence?: RecurrenceType;
    priority?: PriorityType;
    color?: string;
    userIds: string[];
  };
}

interface UpdateCalendarInput {
  input: {
    id: string;
    name?: string;
    dateTimeStart?: string;
    dateTimeEnd?: string;
    description?: string;
    recurrence?: RecurrenceType;
    priority?: PriorityType;
    color?: string;
  };
}

interface CreateShopListInput {
  input: {
    id: string;
    familyId: string;
    name: string;
    description?: string;
    quantity?: number;
    category?: ShopListCategory;
    priority?: PriorityType;
    userIds: string[];
  };
}

interface UpdateShopListInput {
  input: {
    id: string;
    name?: string;
    description?: string;
    quantity?: number;
    category?: ShopListCategory;
    priority?: PriorityType;
    userIds?: string[];
  };
}

interface CreateHomeDutyInput {
  input: {
    id: string;
    familyId: string;
    name: string;
    description?: string;
    assignTo: string;
    dueTo: string;
    recurrence?: RecurrenceType;
    userIds: string[];
  };
}

interface UpdateHomeDutyInput {
  input: {
    id: string;
    name?: string;
    description?: string;
    assignTo: string;
    dueTo: string;
    recurrence?: RecurrenceType;
    userIds?: string[];
  };
}

interface CreateExpenseInput {
  input: {
    id: string;
    familyId: string;
    name: string;
    userId: string;
    amount: number;
    currency: Currency;
    date: string;
    note?: string;
    category: ExpenseCategory;
  };
}

interface UpdateExpenseInput {
  input: {
    id: string;
    name?: string;
    amount?: number;
    currency?: Currency;
    date?: string;
    note?: string;
    category?: ExpenseCategory;
  };
}

const resolvers = {
  Json: GraphQLJSON,
  Query: {
    families: () =>
      prisma.family.findMany({
        include: {
          members: true,
          calendars: true,
          shopLists: true,
          homeDuties: true,
          expenses: true,
        },
      }),
    family: (_: unknown, args: { id: string }) =>
      prisma.family.findUnique({
        where: { id: args.id },
        include: {
          members: true,
          calendars: true,
          shopLists: true,
          homeDuties: true,
          expenses: true,
        },
      }),

    familyByUserId: (_: unknown, args: { userId: string }) => {
      return prisma.family.findFirst({
        where: {
          members: {
            some: { id: args.userId },
          },
        },
        include: {
          members: true,
          calendars: true,
          shopLists: true,
          homeDuties: true,
          expenses: true,
        },
      });
    },

    users: () => prisma.user.findMany({ include: { family: true } }),

    userByGmail: (_: unknown, args: { gmail: string }) =>
      prisma.user.findUnique({
        where: { gmail: args.gmail },
        include: { family: true },
      }),

    user: (_: unknown, args: { gmail: string }) =>
      prisma.user.findUnique({
        where: { gmail: args.gmail },
        include: {
          family: {
            include: {
              calendars: true,
              shopLists: true,
              homeDuties: true,
              expenses: true,
            },
          },
        },
      }),

    calendars: (_: unknown, args: { familyId: string }) =>
      prisma.calendar.findMany({
        where: { familyId: args.familyId },
        include: { users: true, family: true },
      }),
    calendar: (_: unknown, args: { id: string }) =>
      prisma.calendar.findUnique({
        where: { id: args.id },
        include: { users: true, family: true },
      }),

    shopLists: (_: unknown, args: { familyId: string }) =>
      prisma.shopList.findMany({
        where: { familyId: args.familyId },
        include: { users: true, family: true },
      }),
    shopList: (_: unknown, args: { id: string }) =>
      prisma.shopList.findUnique({
        where: { id: args.id },
        include: { users: true, family: true },
      }),

    homeDuties: (_: unknown, args: { familyId: string }) =>
      prisma.homeDuty.findMany({
        where: { familyId: args.familyId },
        include: { users: true, family: true },
      }),
    homeDuty: (_: unknown, args: { id: string }) =>
      prisma.homeDuty.findUnique({
        where: { id: args.id },
        include: { users: true, family: true },
      }),

    expenses: (_: unknown, args: { familyId: string }) =>
      prisma.expense.findMany({
        where: { familyId: args.familyId },
        include: { user: true, family: true },
      }),
    expense: (_: unknown, args: { id: string }) =>
      prisma.expense.findUnique({
        where: { id: args.id },
        include: { user: true, family: true },
      }),
  },

  Mutation: {
    createFamily: (_: unknown, { input }: CreateFamilyInput) =>
      prisma.family.create({
        data: {
          name: input.name,
          members: { connect: { id: input.userId } },
        },
        include: { members: true },
      }),

    joinFamily: (_: unknown, { input }: JoinFamilyInput) =>
      prisma.user.update({
        where: { id: input.userId },
        data: {
          familyId: input.familyId,
          role: Role.MEMBER,
        },
        include: { family: true },
      }),

    updateUserFamily: (_: unknown, { input }: UpdateUserFamilyInput) =>
      prisma.user.update({
        where: { id: input.userId },
        data: { familyId: input.familyId },
        include: { family: true },
      }),

    updateUserImage: (_: unknown, { input }: UpdateUserImageInput) =>
      prisma.user.update({
        where: { id: input.userId },
        data: { imageUrl: input.imageUrl },
        include: { family: true },
      }),

    createUser: (_: unknown, { input }: CreateUserInput) =>
      prisma.user.create({
        data: {
          name: input.name,
          gmail: input.gmail,
          language: input.language ?? "en",
          password: input.password ?? null,
          provider: input.provider ?? "credentials",
          familyId: input.familyId ?? null,
          role: input.role ?? Role.MEMBER,
        },
        include: { family: true },
      }),

    updateUserRole: (_: unknown, { input }: UpdateUserRoleInput) =>
      prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        include: { family: true },
      }),
    updateUserCurrency: (_: unknown, { input }: UpdateUserCurrencyInput) =>
      prisma.user.update({
        where: { id: input.userId },
        data: { constCurrency: input.constCurrency },
        include: { family: true },
      }),

    deleteUser: async (_: unknown, { input }: { input: { id: string } }) => {
      if (!input?.id) {
        throw new Error("User ID is required");
      }
      const { id } = input;
      await prisma.expense.deleteMany({ where: { userId: id } });
      await prisma.user.update({
        where: { id },
        data: {
          Calendar: { set: [] },
          ShopList: { set: [] },
          HomeDuty: { set: [] },
        },
      });
      return prisma.user.delete({ where: { id } });
    },

    leaveFamily: (_: unknown, args: { userId: string }) =>
      prisma.user.update({
        where: { id: args.userId },
        data: { familyId: null },
        include: { family: true },
      }),

    updateUserLanguage: (_: unknown, { input }: UpdateUserLanguageInput) =>
      prisma.user.update({
        where: { id: input.userId },
        data: { language: input.language },
        include: { family: true },
      }),

    updateUserColorTheme: (_: unknown, { input }: UpdateUserColorThemeInput) =>
      prisma.user.update({
        where: { id: input.userId },
        data: { colorTheme: input.colorTheme },
        include: { family: true },
      }),

    updateUserName: (_: unknown, { input }: UpdateUserNameInput) =>
      prisma.user.update({
        where: { id: input.userId },
        data: { name: input.name },
        include: { family: true },
      }),

    updateUserPassword: async (
      _: unknown,
      { input }: UpdateUserPasswordInput,
    ) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      });
      if (!user) {
        throw new Error("User not found");
      }
      if (!user.password) {
        throw new Error(
          "You do not have a password set (did you sign up via Google/Apple?).",
        );
      }
      const isMatch = await bcrypt.compare(input.oldPassword, user.password);
      if (!isMatch) {
        throw new Error("The old password you entered is incorrect.");
      }
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      return prisma.user.update({
        where: { id: input.userId },
        data: { password: hashedPassword },
        include: { family: true },
      });
    },

    updateUserSubNotification: (
      _: unknown,
      { input }: UpdateUserSubNotificationInput,
    ) =>
      prisma.user.update({
        where: { id: input.userId },
        data: {
          notifyCalendar: input.notifyCalendar,
          notifyShopList: input.notifyShopList,
          notifyHomeDuty: input.notifyHomeDuty,
          notifyExpenses: input.notifyExpenses,
        },
        include: { family: true },
      }),

    updateUserNotification: (
      _: unknown,
      { input }: UpdateUserNotificationInput,
    ) =>
      prisma.user.update({
        where: { id: input.userId },
        data: { notification: input.notification },
        include: { family: true },
      }),

    createCalendar: (_: unknown, { input }: CreateCalendarInput) =>
      prisma.calendar.create({
        data: {
          id: input.id,
          name: input.name,
          dateTimeStart: new Date(input.dateTimeStart),
          dateTimeEnd: new Date(input.dateTimeEnd),
          description: input.description,
          recurrence: input.recurrence,
          priority: input.priority,
          color: input.color,
          familyId: input.familyId,
          users: { connect: input.userIds.map((id) => ({ id })) },
        },
        include: { users: true, family: true },
      }),

    updateCalendar: (_: unknown, { input }: UpdateCalendarInput) => {
      const { id, ...updateData } = input;

      return prisma.calendar.update({
        where: { id },
        data: {
          ...updateData,
          name: updateData.name,
          dateTimeStart: updateData.dateTimeStart,
          dateTimeEnd: updateData.dateTimeEnd,
        },
        include: { users: true, family: true },
      });
    },

    deleteCalendar: (_: unknown, { id }: { id: string }) =>
      prisma.calendar.delete({
        where: { id },
        include: { users: true, family: true },
      }),

    createShopList: (_: unknown, { input }: CreateShopListInput) =>
      prisma.shopList.create({
        data: {
          id: input.id,
          name: input.name,
          description: input.description,
          familyId: input.familyId,
          quantity: input.quantity,
          category: input.category,
          priority: input.priority,
          users: { connect: input.userIds.map((id) => ({ id })) },
        },
        include: { users: true, family: true },
      }),

    updateShopList: (_: unknown, { input }: UpdateShopListInput) => {
      const { id, userIds, ...updateData } = input;

      return prisma.shopList.update({
        where: { id },
        data: {
          ...updateData,
          ...(userIds && {
            users: { set: userIds.map((id) => ({ id })) },
          }),
        },
        include: { users: true, family: true },
      });
    },

    deleteShopList: (_: unknown, { id }: { id: string }) =>
      prisma.shopList.delete({
        where: { id },
        include: { users: true, family: true },
      }),

    createHomeDuty: (_: unknown, { input }: CreateHomeDutyInput) =>
      prisma.homeDuty.create({
        data: {
          id: input.id,
          name: input.name,
          description: input.description,
          assignTo: input.assignTo,
          dueTo: input.dueTo,
          recurrence: input.recurrence,
          familyId: input.familyId,
          users: { connect: input.userIds.map((id) => ({ id })) },
        },
        include: { users: true, family: true },
      }),

    updateHomeDuty: async (_: unknown, { input }: UpdateHomeDutyInput) => {
      const { id, userIds, ...updateData } = input;

      return prisma.homeDuty.update({
        where: { id },
        data: {
          ...updateData,
          ...(userIds
            ? { users: { set: userIds.map((uid) => ({ id: uid })) } }
            : {}),
        },
        include: { users: true, family: true },
      });
    },

    deleteHomeDuty: (_: unknown, { id }: { id: string }) =>
      prisma.homeDuty.delete({
        where: { id },
        include: { users: true, family: true },
      }),

    createExpense: (_: unknown, { input }: CreateExpenseInput) =>
      prisma.expense.create({
        data: input,
        include: { user: true, family: true },
      }),

    updateExpense: async (_: unknown, { input }: UpdateExpenseInput) => {
      const { id, date, ...rest } = input;

      return prisma.expense.update({
        where: { id },
        data: {
          ...rest,
          ...(date ? { date: new Date(date) } : {}),
        },
        include: { user: true, family: true },
      });
    },

    deleteExpense: (_: unknown, { id }: { id: string }) =>
      prisma.expense.delete({
        where: { id },
        include: { user: true, family: true },
      }),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
});

const handler = startServerAndCreateNextHandler(server);

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
