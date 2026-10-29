"use client";

import { useState } from "react";
import {
  Button,
  Chip,
  DatePicker,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { parseDate, type DateValue } from "@internationalized/date";

type DateSuggestion = {
  semester: string;
  semesterCode: string;
  semesterSource: "current-date" | "course-selection";
  startDate: string | null;
  endDate: string | null;
  startSource: "college-calendar" | "course-data" | null;
  endSource: "college-calendar" | "course-data" | null;
  feedAvailable: boolean;
  feedUrl: string;
};

function sourceLabel(source: DateSuggestion["startSource"]) {
  if (source === "college-calendar") return "College calendar";
  if (source === "course-data") return "Course schedule";
  return "Enter manually";
}

export default function CalendarExportButton({ planId }: { planId: Number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [suggestion, setSuggestion] = useState<DateSuggestion | null>(null);
  const [startDate, setStartDate] = useState<DateValue | null>(null);
  const [endDate, setEndDate] = useState<DateValue | null>(null);
  const [error, setError] = useState("");

  async function openConfirmation() {
    setIsOpen(true);
    setIsLoading(true);
    setSuggestion(null);
    setStartDate(null);
    setEndDate(null);
    setError("");

    try {
      const response = await fetch(`/api/exportical/dates?id=${planId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to find dates");

      const nextSuggestion = data as DateSuggestion;
      setSuggestion(nextSuggestion);
      if (nextSuggestion.startDate) {
        setStartDate(parseDate(nextSuggestion.startDate));
      }
      if (nextSuggestion.endDate) {
        setEndDate(parseDate(nextSuggestion.endDate));
      }
    } catch (loadError) {
      console.error(loadError);
      setError(
        "We could not determine the semester dates. You can still enter them manually."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function downloadCalendar() {
    if (!startDate || !endDate) {
      setError("Choose both a start and end date before exporting.");
      return;
    }
    if (startDate.compare(endDate) > 0) {
      setError("The semester end must be after the semester start.");
      return;
    }

    setIsDownloading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        id: String(planId),
        start: startDate.toString(),
        end: endDate.toString(),
      });
      const response = await fetch(`/api/exportical?${params.toString()}`);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Unable to export calendar");
      }

      const blobUrl = URL.createObjectURL(await response.blob());
      const disposition = response.headers.get("Content-Disposition") || "";
      const filename =
        /filename="([^"]+)"/i.exec(disposition)?.[1] || "course-plan.ics";
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(blobUrl);
      setIsOpen(false);
    } catch (downloadError) {
      console.error(downloadError);
      setError("The calendar could not be downloaded. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
      <Button
        className="border border-slate-200 bg-white/90 font-semibold text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100"
        size="sm"
        startContent={<CalendarMonthIcon fontSize="small" />}
        variant="bordered"
        onPress={openConfirmation}
      >
        Export
      </Button>

      <Modal
        backdrop="blur"
        isDismissable={!isDownloading}
        isKeyboardDismissDisabled={isDownloading}
        isOpen={isOpen}
        placement="center"
        size="lg"
        onOpenChange={(open) => {
          if (!isDownloading) setIsOpen(open);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-default-200 px-6 py-5">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  iCal export
                </span>
                <span className="text-xl font-bold tracking-tight">
                  Confirm semester dates
                </span>
                <span className="text-sm font-normal text-default-500">
                  Recurring classes will only be created inside this range.
                </span>
              </ModalHeader>

              <ModalBody className="gap-5 px-6 py-5">
                {isLoading ? (
                  <div className="grid min-h-48 place-items-center">
                    <Spinner label="Checking the college calendar" />
                  </div>
                ) : (
                  <>
                    {suggestion ? (
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-default-100 px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-default-500">
                            Detected semester
                          </p>
                          <p className="font-bold text-foreground">
                            {suggestion.semester}
                          </p>
                          <p className="text-xs text-default-500">
                            {suggestion.semesterSource === "current-date"
                              ? "Chosen from today’s date"
                              : "Using your selected course semester"}
                          </p>
                        </div>
                        <Link
                          isExternal
                          className="text-xs font-semibold"
                          href={suggestion.feedUrl}
                          showAnchorIcon
                          anchorIcon={
                            <OpenInNewRoundedIcon fontSize="inherit" />
                          }
                        >
                          View source
                        </Link>
                      </div>
                    ) : null}

                    {error ? (
                      <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:bg-warning-50/10">
                        {error}
                      </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <DatePicker
                          isRequired
                          granularity="day"
                          label="Classes begin"
                          value={startDate}
                          onChange={setStartDate}
                        />
                        <Chip className="w-fit" size="sm" variant="flat">
                          {sourceLabel(suggestion?.startSource || null)}
                        </Chip>
                      </div>
                      <div className="flex flex-col gap-2">
                        <DatePicker
                          isRequired
                          granularity="day"
                          label="Classes end"
                          minValue={startDate || undefined}
                          value={endDate}
                          onChange={setEndDate}
                        />
                        <Chip className="w-fit" size="sm" variant="flat">
                          {sourceLabel(suggestion?.endSource || null)}
                        </Chip>
                      </div>
                    </div>

                    <p className="text-xs leading-5 text-default-500">
                      Dates are suggested from Swarthmore’s published college
                      calendar and remain editable before export.
                    </p>
                  </>
                )}
              </ModalBody>

              <ModalFooter className="border-t border-default-200 px-6 py-4">
                <Button
                  isDisabled={isDownloading}
                  variant="light"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#f46523] font-semibold text-white dark:bg-orange-400 dark:text-slate-950"
                  isDisabled={isLoading || !startDate || !endDate}
                  isLoading={isDownloading}
                  startContent={
                    isDownloading ? null : (
                      <DownloadRoundedIcon fontSize="small" />
                    )
                  }
                  onPress={downloadCalendar}
                >
                  Confirm and download
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
