-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."RecurrenceType" AS ENUM ('ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."ExpenseCategory" AS ENUM ('FOOD', 'BILLS', 'TRANSPORT', 'SHOPPING', 'HEALTH', 'ENTERTAINMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ShopListCategory" AS ENUM ('FOOD', 'CLOTHES', 'ENTERTAINMENT', 'HEALTH', 'HOUSE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PriorityType" AS ENUM ('HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('USD', 'EUR', 'CZK');

-- CreateTable
CREATE TABLE "public"."Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gmail" TEXT NOT NULL,
    "password" TEXT,
    "provider" TEXT NOT NULL,
    "imageUrl" TEXT,
    "role" "public"."Role" NOT NULL,
    "colorTheme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "notification" BOOLEAN NOT NULL DEFAULT false,
    "constCurrency" "public"."Currency" NOT NULL DEFAULT 'EUR',
    "familyId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Calendar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateTimeStart" TIMESTAMP(3) NOT NULL,
    "dateTimeEnd" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "recurrence" "public"."RecurrenceType" NOT NULL DEFAULT 'ONE_TIME',
    "priority" "public"."PriorityType" NOT NULL DEFAULT 'NORMAL',
    "familyId" TEXT NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER,
    "priority" "public"."PriorityType" NOT NULL DEFAULT 'NORMAL',
    "category" "public"."ShopListCategory" NOT NULL DEFAULT 'FOOD',
    "familyId" TEXT NOT NULL,

    CONSTRAINT "ShopList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomeDuty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "assignTo" TEXT NOT NULL,
    "dueTo" TIMESTAMP(3),
    "familyId" TEXT NOT NULL,

    CONSTRAINT "HomeDuty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Expense" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "category" "public"."ExpenseCategory" NOT NULL,
    "userId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CalendarUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CalendarUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ShopListUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ShopListUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_HomeDutyUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_HomeDutyUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_gmail_key" ON "public"."User"("gmail");

-- CreateIndex
CREATE INDEX "_CalendarUsers_B_index" ON "public"."_CalendarUsers"("B");

-- CreateIndex
CREATE INDEX "_ShopListUsers_B_index" ON "public"."_ShopListUsers"("B");

-- CreateIndex
CREATE INDEX "_HomeDutyUsers_B_index" ON "public"."_HomeDutyUsers"("B");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Calendar" ADD CONSTRAINT "Calendar_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopList" ADD CONSTRAINT "ShopList_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HomeDuty" ADD CONSTRAINT "HomeDuty_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "public"."Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CalendarUsers" ADD CONSTRAINT "_CalendarUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CalendarUsers" ADD CONSTRAINT "_CalendarUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ShopListUsers" ADD CONSTRAINT "_ShopListUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."ShopList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ShopListUsers" ADD CONSTRAINT "_ShopListUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HomeDutyUsers" ADD CONSTRAINT "_HomeDutyUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."HomeDuty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HomeDutyUsers" ADD CONSTRAINT "_HomeDutyUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
