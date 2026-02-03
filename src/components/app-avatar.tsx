import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppAvatarProps {
  imageUrl: string;
  widths?: number;
  heights?: number;
  name?: string;
}

export function AppAvatar({
  imageUrl,
  widths,
  heights,
  name = "An",
}: AppAvatarProps) {
  return (
    <Avatar
      className="border-1 border-primary"
      style={{ width: widths, height: heights }}
    >
      <AvatarImage src={imageUrl} />
      <AvatarFallback>{name}</AvatarFallback>
    </Avatar>
  );
}
