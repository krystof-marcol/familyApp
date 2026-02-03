import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import apolloClient from "@/lib/apollo-client";
import { GET_USER } from "@/graphql";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { gmail: credentials.email },
          include: { family: true },
        });

        if (!user) throw new Error("No user found with this email");
        if (!user.password)
          throw new Error(
            "This account was created with Google login. Please sign in with Google.",
          );

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user.id,
          name: user.name,
          email: user.gmail,
          role: user.role,
          colorTheme: user.colorTheme,
          notification: user.notification,
          notifyCalendar: user.notifyCalendar,
          notifyShopList: user.notifyShopList,
          notifyHomeDuty: user.notifyHomeDuty,
          notifyExpenses: user.notifyExpenses,
          language: user.language,
          provider: user.provider,
          familyId: user.family?.id,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
  callbacks: {
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { gmail: session.user.email },
          include: { family: true },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.colorTheme = dbUser.colorTheme;
          session.user.language = dbUser.language;
          session.user.notification = dbUser.notification;
          session.user.notifyCalendar = dbUser.notifyCalendar;
          session.user.notifyHomeDuty = dbUser.notifyHomeDuty;
          session.user.notifyShopList = dbUser.notifyShopList;
          session.user.notifyExpenses = dbUser.notifyExpenses;
          session.user.name = dbUser.name;
          session.user.email = dbUser.gmail;
          session.user.role = dbUser.role;
          session.user.imageUrl = dbUser.imageUrl;
          session.user.provider = dbUser.provider;
          session.user.familyId = dbUser.family?.id;
        }
      }
      return session;
    },
  },
};

export async function getUserSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      isAuthenticated: false,
      name: "",
      imageUrl: "",
      family: null,
      familyId: null,
    };
  }
  let familyData = null;

  try {
    const { data } = await apolloClient.query({
      query: GET_USER,
      variables: { gmail: session.user.email },
      fetchPolicy: "no-cache",
    });
    familyData = data?.user?.family ?? null;
  } catch (e) {
    console.error("Failed to fetch user details via Apollo", e);
  }

  return {
    isAuthenticated: true,
    name: session.user.name ?? "Name",
    imageUrl: session.user.imageUrl ?? "",
    familyId: session.user.familyId,
    family: familyData,
  };
}
