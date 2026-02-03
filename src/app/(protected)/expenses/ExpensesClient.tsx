"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  GET_FAMILY_BY_USERID,
  UPDATE_USER_CURRENCY,
  GET_USER_BY_GMAIL,
} from "@/graphql";
import { ExpenseCategory, Currency } from "@prisma/client";
import { useCreateExpenses } from "@/app/(protected)/expenses/createNewEvent";
import { useAlert } from "@/components/logic/AlertProvider";
import PopupCreateEvent from "@/app/(protected)/expenses/popupEvent";
import TableEventPopup from "@/app/(protected)/expenses/tableEventPopup";
import LinearGraph from "@/app/(protected)/expenses/linearGraph";
import DonutChart from "@/app/(protected)/expenses/circleGraph";
import MotionButton from "@/components/ui/motion-button";
import { useCurrencyLogic } from "@/hooks/useCurrencyLogic";
import { usePageTutorial } from "@/hooks/usePageTutorial";
import {
  useQuery as useReactQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";

interface ExpensesListProps {
  id: string;
  name: string;
  amount: string;
  currency: Currency;
  date: Date;
  note: string | undefined;
  category: ExpenseCategory;
  userId: string;
  user: {
    id: string;
    name: string;
  };
}

interface userProps {
  id: string;
  name: string;
  role: string;
}

interface RawExpenseData {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  date: string;
  note: string | null;
  category: ExpenseCategory;
  userId: string;
  familyId: string;
}

type OptimisticUpdateProps = Partial<ExpensesListProps> & { id: string };

const fetchEvents = async (id: string) => {
  const res = await fetch(`/api/expenses?familyId=${id}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
};

export default function ExpensesClient() {
  const t = useTranslations("Expenses");
  const { createNewEvent } = useCreateExpenses();
  const { showAlert } = useAlert();
  const { convertToEuro } = useCurrencyLogic();

  const [currency, setCurrency] = useState<Currency>(Currency.EUR);
  const [open, setOpen] = useState(false);
  const [moneySpend, setMoneySpend] = useState("week");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ExpensesListProps | null>(
    null,
  );

  const [updateCurrency] = useMutation(UPDATE_USER_CURRENCY);
  const queryClient = useQueryClient();
  const { rates } = useCurrencyLogic();

  const [optimisticEvents, setOptimisticEvents] = useState<ExpensesListProps[]>(
    [],
  );
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    OptimisticUpdateProps[]
  >([]);
  const [optimisticDeletes, setOptimisticDeletes] = useState<string[]>([]);
  const { data: session, status } = useSession();

  const userId = session?.user?.id || "";
  const familyId = session?.user?.familyId || "";
  const userGmail = session?.user?.email;
  const userName = session?.user?.name || "";
  const language = session?.user?.language || "";

  const { data: userData } = useQuery(GET_USER_BY_GMAIL, {
    variables: { gmail: userGmail },
    fetchPolicy: "cache-first",
  });

  const { data: familyData } = useQuery(GET_FAMILY_BY_USERID, {
    variables: { userId },
  });

  const { data: eventsData, isLoading: isExpensesLoading } = useReactQuery({
    queryKey: ["expenseList", familyId],
    queryFn: () => fetchEvents(familyId),
    enabled: !!familyId,
  });

  usePageTutorial({
    tutorialId: "expenses_intro",
    steps: [
      {
        element: "#select-currency",
        popover: {
          title: t("Tutorial.select.title"),
          description: t("Tutorial.select.description"),
          side: "bottom",
        },
      },
      {
        element: "#add-new-event",
        popover: {
          title: t("Tutorial.createEvent.title"),
          description: t("Tutorial.createEvent.description"),
          side: "bottom",
        },
      },
      {
        element: "#div-select-who-time",
        popover: {
          title: t("Tutorial.reportFilter.title"),
          description: t("Tutorial.reportFilter.description"),
          side: "bottom",
        },
      },
    ],
  });

  const handleUpdateCurrency = async (newCurrency: Currency) => {
    setCurrency(newCurrency);
    await updateCurrency({
      variables: { input: { userId, constCurrency: newCurrency } },
    });
  };

  const convertFromEuro = useCallback(
    (amount: number, targetCurrency: Currency) => {
      if (!rates) return amount;
      if (targetCurrency === "EUR") return amount;
      const rate = rates[targetCurrency as "USD" | "CZK"];
      if (!rate) return amount;
      return amount * rate;
    },
    [rates],
  );

  const dataUsers = useMemo(
    () => familyData?.familyByUserId?.members ?? [],
    [familyData],
  );

  const usersList = useMemo(() => {
    return dataUsers.map((u: userProps) => ({
      id: u.id,
      name: u.name,
      role: u.role,
    }));
  }, [dataUsers]);

  const handleOptimisticUpdate = useCallback((data: OptimisticUpdateProps) => {
    setOptimisticUpdates((prev) => [
      ...prev.filter((u) => u.id !== data.id),
      data,
    ]);
  }, []);

  const handleOptimisticDelete = useCallback((id: string) => {
    setOptimisticDeletes((prev) => [...prev, id]);
  }, []);

  const ExpensesItems = useMemo(() => {
    const rawData = Array.isArray(eventsData) ? eventsData : [];
    let lists: ExpensesListProps[] = rawData.map((item: RawExpenseData) => {
      const expenseUser = dataUsers.find(
        (u: userProps) => u.id === item.userId,
      );
      const expenseUserName = expenseUser ? expenseUser.name : "Unknown";

      return {
        id: item.id,
        name: item.name,
        amount: item.amount.toString(),
        currency: item.currency,
        date: new Date(item.date),
        note: item.note || undefined,
        category: item.category,
        userId: item.userId,
        user: {
          id: item.userId,
          name: expenseUserName,
        },
      };
    });

    lists = lists.filter(
      (item: ExpensesListProps) => !optimisticDeletes.includes(item.id),
    );

    lists = lists.map((item: ExpensesListProps) => {
      const update = optimisticUpdates.find((update) => update.id === item.id);
      return update ? { ...item, ...update } : item;
    });

    const uniqueOptimisticEvents = optimisticEvents.filter((optEvent) => {
      const existsInServer = lists.some(
        (serverEvent: ExpensesListProps) => serverEvent.id === optEvent.id,
      );
      const isDeleted = optimisticDeletes.includes(optEvent.id);
      return !existsInServer && !isDeleted;
    });

    return [...lists, ...uniqueOptimisticEvents];
  }, [
    eventsData,
    optimisticDeletes,
    optimisticEvents,
    optimisticUpdates,
    dataUsers,
  ]);

  const SpendMoney = useMemo(() => {
    const lists = ExpensesItems ?? [];
    const today = new Date();
    const frame = moneySpend;
    let sum = 0;
    if (frame === "week") today.setDate(today.getDate() - 7);
    if (frame === "month") today.setMonth(today.getMonth() - 1);
    if (frame === "year") today.setFullYear(today.getFullYear() - 1);
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < lists.length; i++) {
      const expenseDate = new Date(lists[i].date);
      expenseDate.setHours(0, 0, 0, 0);
      if (expenseDate >= today) {
        if (selectedUser === "all" || lists[i].userId === selectedUser) {
          if (lists[i].currency === currency) {
            sum += Number(lists[i].amount);
          } else {
            sum += convertFromEuro(
              convertToEuro(Number(lists[i].amount), lists[i].currency),
              currency,
            );
          }
        }
      }
    }
    return sum;
  }, [
    ExpensesItems,
    moneySpend,
    currency,
    selectedUser,
    convertFromEuro,
    convertToEuro,
  ]);

  const handleSubmitEvent = async (data: {
    name: string;
    note?: string;
    category: ExpenseCategory;
    currency: Currency;
    amount: number;
    date: Date;
  }) => {
    const permanentId = crypto.randomUUID().toString();
    const optimisticData: ExpensesListProps = {
      id: permanentId,
      name: data.name,
      note: data.note,
      category: data.category,
      currency: data.currency,
      date: data.date,
      amount: data.amount.toString(),
      userId: userId,
      user: { id: userId, name: userData?.userByGmail?.name ?? userName },
    };

    setOptimisticEvents((prev) => [...prev, optimisticData]);
    setOpen(false);

    setTimeout(async () => {
      try {
        await createNewEvent({
          id: permanentId,
          name: data.name,
          note: data.note,
          category: data.category,
          amount: data.amount,
          date: data.date,
          currency: data.currency,
          userIds: userId,
          familyId,
          title: t("titleNotification"),
          body: `${userName} ${t("added")}: ${data.name}`,
          currentUser: userName,
        });
        showAlert(`${t("success")}`);
        await queryClient.invalidateQueries({
          queryKey: ["expenseList", familyId],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setOptimisticEvents((prev) =>
          prev.filter((item) => item.id !== permanentId),
        );
      }
    }, 0);
  };

  useEffect(() => {
    if (userData?.userByGmail?.constCurrency) {
      setCurrency(userData.userByGmail.constCurrency);
    }
  }, [userData]);

  if (status === "loading") {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="h-[80vh] border rounded-md bg-muted/10" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full max-w-[92vw] overflow-x-hidden sm:px-4 py-4 lg:h-screen overflow-hidden h-auto">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-medium">{t("title")}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("info")}
          </p>

          <div className="flex items-center justify-between mt-2">
            <Select
              value={currency}
              onValueChange={(value) => handleUpdateCurrency(value as Currency)}
            >
              <SelectTrigger
                id="select-currency"
                className="text-xs sm:text-sm w-24 sm:w-28"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Currency.EUR}>EUR</SelectItem>
                <SelectItem value={Currency.CZK}>CZK</SelectItem>
                <SelectItem value={Currency.USD}>USD</SelectItem>
              </SelectContent>
            </Select>

            <MotionButton
              id="add-new-event"
              className="text-xs sm:text-sm w-20 sm:w-auto"
              onClick={() => setOpen(true)}
            >
              {t("new")}
            </MotionButton>
          </div>
        </div>

        <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2 flex-shrink-0" />

        <div className="flex flex-col lg:flex-row gap-4 w-full min-w-0 lg:flex-1 lg:overflow-hidden h-auto">
          <div className="flex flex-col gap-4 lg:flex-[0.6] w-full min-w-0 lg:h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-shrink-0">
              <Card
                id="div-select-who-time"
                className="h-[200px] lg:h-[24vh] border border-primary shadow-sm relative"
              >
                <CardContent className="relative flex flex-row justify-between items-end gap-3 sm:gap-4 h-full p-4 sm:p-6">
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm font-medium truncate">
                      {t("Card1.spendMoney")}
                    </Label>
                    <Select value={moneySpend} onValueChange={setMoneySpend}>
                      <SelectTrigger className="w-full text-xs sm:text-sm bg-primary text-white dark:bg-primary hover:opacity-90">
                        <SelectValue className="truncate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">{t("Card1.week")}</SelectItem>
                        <SelectItem value="month">
                          {t("Card1.month")}
                        </SelectItem>
                        <SelectItem value="year">{t("Card1.year")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <Label className="text-xs sm:text-sm font-medium truncate">
                      {t("Card2.chooseUser")}:
                    </Label>
                    <Select
                      value={selectedUser}
                      onValueChange={setSelectedUser}
                    >
                      <SelectTrigger className="w-full text-xs sm:text-sm bg-primary text-white dark:bg-primary hover:opacity-90">
                        <SelectValue className="truncate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("Card1.all")}</SelectItem>
                        {usersList.map((user: userProps) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-[200px] lg:h-[24vh] border border-primary shadow-sm relative">
                <CardContent className="relative flex flex-col justify-center items-center h-full text-center p-4 sm:p-6">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("Card1.totalSpend")}
                  </span>
                  {isExpensesLoading ? (
                    <Skeleton className="h-8 w-32 mt-1" />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-semibold mt-1">
                      {Number(SpendMoney).toFixed(0)} {currency}
                    </span>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="flex lg:flex-1 h-[400px] lg:h-auto overflow-hidden border border-primary min-h-0">
              <CardContent className="overflow-y-auto h-full w-full p-2 sm:p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 transition-colors">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">
                        {t("Table.name")}
                      </TableHead>
                      <TableHead className="w-[20%]">
                        {t("Table.who")}
                      </TableHead>
                      <TableHead className="w-[25%]">
                        {t("Table.category")}
                      </TableHead>
                      <TableHead className="w-[25%] text-right">
                        {t("Table.price")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isExpensesLoading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <TableRow key={`skeleton-${i}`}>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell className="text-right flex justify-end">
                              <Skeleton className="h-4 w-12" />
                            </TableCell>
                          </TableRow>
                        ))
                      : ExpensesItems.slice()
                          .filter((item: ExpensesListProps) => {
                            const now = new Date();
                            const d = new Date(item.date);
                            const cutoff = new Date(now);
                            if (moneySpend === "week")
                              cutoff.setDate(now.getDate() - 8);
                            if (moneySpend === "month")
                              cutoff.setMonth(now.getMonth() - 1);
                            if (moneySpend === "year")
                              cutoff.setFullYear(now.getFullYear() - 1);
                            return d >= cutoff && d <= now;
                          })
                          .filter((item: ExpensesListProps) =>
                            selectedUser === "all"
                              ? item
                              : item.userId === selectedUser,
                          )
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime(),
                          )
                          .map((item: ExpensesListProps) => (
                            <TableRow
                              key={item.id}
                              onClick={() => setSelectedItem(item)}
                              className="cursor-pointer hover:bg-muted/50"
                            >
                              <TableCell className="font-medium truncate">
                                {item.name}
                              </TableCell>
                              <TableCell className="truncate">
                                {item.user.name}
                              </TableCell>
                              <TableCell className="pl-5 truncate">
                                {t(`category.${item.category}`)}
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {item.amount}
                                {item.currency}
                              </TableCell>
                            </TableRow>
                          ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 lg:flex-[0.4] w-full min-w-0 lg:h-full">
            <Card className="h-[300px] lg:h-[40vh] border border-primary pb-0 pt-1 pr-1 pl-0">
              <CardContent className="flex justify-center items-center h-full p-0 overflow-hidden relative">
                <div className="w-full h-full p-4">
                  {isExpensesLoading ? (
                    <div className="w-full h-full flex items-end gap-2 px-2 pb-6">
                      <Skeleton className="h-[40%] w-full" />
                      <Skeleton className="h-[70%] w-full" />
                      <Skeleton className="h-[30%] w-full" />
                      <Skeleton className="h-[50%] w-full" />
                      <Skeleton className="h-[90%] w-full" />
                      <Skeleton className="h-[60%] w-full" />
                    </div>
                  ) : (
                    <LinearGraph
                      data={ExpensesItems}
                      currency={currency}
                      timeFrame={moneySpend}
                      selectedUser={selectedUser}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="h-auto lg:flex-1 border border-primary">
              <CardContent className="flex justify-center items-center h-full overflow-hidden relative p-0">
                <div className="w-full h-full p-4 flex items-center justify-center">
                  {isExpensesLoading ? (
                    <Skeleton className="h-40 w-40 rounded-full border-[1.5rem] border-muted/30" />
                  ) : (
                    <DonutChart
                      data={ExpensesItems}
                      currency={currency}
                      timeFrame={moneySpend}
                      selectedUser={selectedUser}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {open && (
          <PopupCreateEvent
            open={open}
            onOpenChange={setOpen}
            onSubmitLocal={handleSubmitEvent}
            language={language}
            constCurrency={userData?.userByGmail?.constCurrency}
          />
        )}
      </div>

      <TableEventPopup
        open={!!selectedItem}
        setOpen={(open) => {
          if (!open) setSelectedItem(null);
        }}
        name={selectedItem?.name ?? ""}
        note={selectedItem?.note}
        amount={Number(selectedItem?.amount).toFixed(0).toString() ?? ""}
        currency={selectedItem?.currency ?? Currency.EUR}
        date={selectedItem?.date ?? new Date()}
        category={selectedItem?.category ?? ExpenseCategory.OTHER}
        id={selectedItem?.id ?? ""}
        userId={selectedItem?.userId ?? ""}
        userName={selectedItem?.user.name ?? ""}
        familyId={familyId}
        optimisticDelete={handleOptimisticDelete}
        optimisticUpdate={handleOptimisticUpdate}
      />
    </>
  );
}
