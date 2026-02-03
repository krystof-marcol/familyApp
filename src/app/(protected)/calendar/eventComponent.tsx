import { Card, CardContent } from "@/components/ui/card";

interface EventCardProps {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  priority?: "Low" | "Normal" | "High";
}

export const EventCard = ({
  title,
  description,
  start,
  end,
}: EventCardProps) => {
  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {start.toLocaleDateString()}{" "}
            {start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            –{" "}
            {end.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
