"use client";

import { Button, Card, CardBody, Link } from "@nextui-org/react";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useEffect, useRef, useState } from "react";

import { COURSE_ADDED_EVENT } from "@/lib/courseAddedEvent";
import { saveSwatGptNotification } from "@/lib/plannerNotifications";

const PROMO_COOKIE = "planner_swatgpt_promo_seen";
const ONE_YEAR = 60 * 60 * 24 * 365;

export default function SwatGptPromo() {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hasSeenPromo = document.cookie
      .split("; ")
      .some((cookie) => cookie.startsWith(`${PROMO_COOKIE}=`));

    if (hasSeenPromo) saveSwatGptNotification();

    function dismiss() {
      saveSwatGptNotification();
      setIsVisible(false);
      setTimeout(() => setIsMounted(false), 300);
    }

    function showPromo() {
      const hasSeenPromo = document.cookie
        .split("; ")
        .some((cookie) => cookie.startsWith(`${PROMO_COOKIE}=`));

      if (hasSeenPromo) return;

      document.cookie = `${PROMO_COOKIE}=1; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
      dismissTimer.current = setTimeout(dismiss, 12000);
    }

    window.addEventListener(COURSE_ADDED_EVENT, showPromo);

    return () => {
      window.removeEventListener(COURSE_ADDED_EVENT, showPromo);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  function dismiss() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    saveSwatGptNotification();
    setIsVisible(false);
    setTimeout(() => setIsMounted(false), 300);
  }

  if (!isMounted) return null;

  return (
    <Card
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-[200] w-[min(24rem,calc(100vw-2.5rem))] border border-primary/20 bg-content1/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-[calc(100%+2rem)] opacity-0"
      }`}
    >
      <CardBody className="flex-row items-start gap-3 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <AutoAwesomeRoundedIcon />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="pr-6 text-sm font-bold text-foreground">
            Enjoying Planner? You may like SwatGPT.
          </h2>
          <p className="mt-1 text-sm leading-5 text-default-500">
            Get help answering questions about Swarthmore, campus resources,
            and student life.
          </p>
          <Button
            as={Link}
            className="mt-3 bg-[#f46523] font-semibold text-white dark:bg-orange-400 dark:text-slate-950"
            endContent={<OpenInNewRoundedIcon fontSize="small" />}
            href="https://chat.sccs.swarthmore.edu"
            isExternal
            size="sm"
          >
            Try SwatGPT
          </Button>
        </div>

        <Button
          isIconOnly
          aria-label="Dismiss SwatGPT recommendation"
          className="absolute right-2 top-2"
          size="sm"
          variant="light"
          onPress={dismiss}
        >
          <CloseRoundedIcon fontSize="small" />
        </Button>
      </CardBody>
    </Card>
  );
}
