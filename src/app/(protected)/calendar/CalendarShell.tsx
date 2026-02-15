import { Skeleton } from "@/components/ui/skeleton";
import MotionButton from "@/components/ui/motion-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalendarShellProps {
  title: string;
  subtitle: string;
  tab1: string;
  tab2: string;
  btnNew: string;
  todayBtn: string;
  viewBtns: [string, string, string];
  dateTitle: string;
  datePrecise: string;
  language: string;
}

export function CalendarShell({
  title,
  subtitle,
  tab1,
  tab2,
  btnNew,
  todayBtn,
  viewBtns,
  dateTitle,
  datePrecise,
  language,
}: CalendarShellProps) {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const formatTime = (h: number) => {
    const date = new Date();
    date.setHours(h, 0, 0, 0);

    if (language === "en") {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return date.toLocaleTimeString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const en_list = ["S", "M", "T", "W", "T", "F", "S"];
  const cz_list = ["N", "P", "Ú", "S", "Č", "P", "S"];
  const dayNames = language === "en" ? en_list : cz_list;

  return (
    <div className="flex flex-col h-[85dvh] overflow-hidden min-[501px]:block min-[501px]:h-auto min-[501px]:overflow-visible">
      <div className="flex items-center justify-between pb-2 pr-2 flex-shrink-0 pt-2 pl-2 min-[501px]:pt-0 min-[501px]:pl-0 min-[501px]:shrink">
        <div>
          <h1 className="text-2xl font-medium">{title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>

      <Tabs
        defaultValue="AllScheduled"
        className={"flex-1 flex flex-col min-h-0 w-full"}
      >
        <div className="flex items-center justify-between pr-2 max-[500px]:flex-shrink-0 max-[500px]:pl-2">
          <TabsList id="tabs-list-calendar-page">
            <TabsTrigger value="AllScheduled">{tab1}</TabsTrigger>
            <TabsTrigger value="events">{tab2}</TabsTrigger>
          </TabsList>

          <MotionButton className="text-xs sm:text-sm">{btnNew}</MotionButton>
        </div>

        <div
          className={
            "w-full h-px bg-gray-200 dark:bg-gray-700 my-2 max-[500px]:flex-shrink-0"
          }
        />

        <TabsContent
          value="AllScheduled"
          className="max-[500px]:flex-1 max-[500px]:flex max-[500px]:flex-col max-[500px]:min-h-0"
        >
          <div className="hidden min-[501px]:flex items-center justify-between pr-2 my-2">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-medium">{dateTitle}</h1>

              <MotionButton size="sm" variant="outline">
                &lt;
              </MotionButton>
              <MotionButton size="sm" variant="outline">
                &gt;
              </MotionButton>
              <MotionButton size="sm">{todayBtn}</MotionButton>
            </div>

            <Tabs defaultValue="timeGridDay">
              <TabsList className="flex space-x-2">
                <TabsTrigger value="timeGridDay">{viewBtns[0]}</TabsTrigger>
                <TabsTrigger value="timeGridWeek">{viewBtns[1]}</TabsTrigger>
                <TabsTrigger value="dayGridMonth">{viewBtns[2]}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="block min-[501px]:hidden flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto mt-[47px] pb-20 no-scrollbar">
              {[0, 1].map((monthIndex) => {
                const now = new Date();
                const currentMonthDate = new Date(
                  now.getFullYear(),
                  now.getMonth() + monthIndex,
                  1,
                );

                const locale = language === "cz" ? "cs-CZ" : "en-US";
                let monthString = currentMonthDate.toLocaleDateString(locale, {
                  month: "long",
                  year: "numeric",
                });
                monthString =
                  monthString.charAt(0).toUpperCase() + monthString.slice(1);

                const daysCount = new Date(
                  currentMonthDate.getFullYear(),
                  currentMonthDate.getMonth() + 1,
                  0,
                ).getDate();

                return (
                  <div key={monthIndex} className="pb-8">
                    <h1 className="text-lg pl-8 font-semibold">
                      {monthString}
                    </h1>

                    <div className="grid mt-[28px] ml-2 mr-2 grid-cols-7 gap-y-4 mb-2">
                      {dayNames.map((day, i) => (
                        <div
                          key={i}
                          className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                        >
                          {day}
                        </div>
                      ))}

                      {Array.from({ length: daysCount }).map((_, i) => {
                        const day = i + 1;
                        const isToday =
                          monthIndex === 0 && day === now.getDate();

                        return (
                          <div
                            key={day}
                            className="flex flex-col items-center justify-start min-h-[72px] w-full"
                          >
                            <div
                              className={`
                      relative h-8 w-8 rounded-full flex items-center justify-center text-sm mb-1 transition-all
                      ${isToday ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-foreground"}
                    `}
                            >
                              {day}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden min-[501px]:block">
            <div className="flex flex-col rounded-lg border border-black dark:border-primary bg-white dark:bg-black overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700 h-[38px]">
                <div className="w-[54.5px] border-r border-gray-200 dark:border-gray-700" />
                <div className="flex-1 flex items-center justify-center text-sm font-medium mt-[1px] mr-[1px]">
                  {datePrecise}
                </div>
              </div>

              <div className="flex relative">
                <div className="w-[54.5px] border-r border-gray-200 dark:border-gray-700">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="h-[49px] border-b border-gray-200 dark:border-gray-700 flex justify-end items-start  pr-1"
                    >
                      <span className="leading-none mt-[4px] text-[1rem]  ">
                        {formatTime(h)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex-1">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="h-[49px] border-b border-gray-200 dark:border-gray-700 w-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
