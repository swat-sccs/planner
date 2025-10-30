import { Chip, Link } from "@nextui-org/react";
import { Rating } from "@prisma/client";

interface RMPBadgeProps {
  rating: Rating;
  size?: "sm" | "md" | "lg";
}

export default function RMPBadge({ rating, size = "sm" }: RMPBadgeProps) {
  if (!rating.isRMP || !rating.rmpLink) {
    return null;
  }

  return (
    <Link
      href={rating.rmpLink}
      isExternal
      className="inline-flex items-center"
    >
      <Chip
        size={size}
        color="warning"
        variant="flat"
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1">
          <span className="font-semibold">RMP</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-3 h-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </div>
      </Chip>
    </Link>
  );
}

