import { Avatar, type AvatarProps } from "@calcom/ui/components/avatar";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

export function TeamLogo({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl: string | null;
  size?: AvatarProps["size"];
}) {
  return (
    <Avatar
      size={size}
      shape="square"
      imageSrc={logoUrl}
      alt={name}
      className="bg-emphasis"
      fallback={<span className="text-emphasis text-xs font-semibold">{initials(name)}</span>}
    />
  );
}
