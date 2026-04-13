"use client";

import Link from "next/link";
import { type ComponentProps, type MouseEvent, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  className?: string;
  children: ReactNode;
  eventName: string;
  eventPayload?: Record<string, string | number | boolean | null | undefined>;
};

export default function TrackedLink({
  className,
  children,
  eventName,
  eventPayload,
  onClick,
  ...props
}: Props & { onClick?: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <Link
      {...props}
      className={className}
      onClick={(event) => {
        trackEvent(eventName, eventPayload);
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
