export type PublicSchedule = {
  id: string;
  event_at: string;
  ends_at?: string | null;
  venue: string;
  city?: string | null;
  capacity?: number | null;
  status: string;
  timezone?: string | null;
  country_code?: string | null;
};

const countryFlags: Record<string, string> = {
  GB: "🇬🇧",
  PH: "🇵🇭",
  SG: "🇸🇬",
};

function timeZoneFor(schedule: PublicSchedule) {
  return schedule.timezone || "Asia/Manila";
}

export function scheduleFlag(schedule: PublicSchedule | string | null | undefined) {
  const countryCode =
    typeof schedule === "string" || schedule == null
      ? schedule
      : schedule.country_code;
  return countryFlags[(countryCode || "PH").toUpperCase()] || "🌍";
}

export function formatScheduleDate(
  eventAt: string,
  includeWeekday = true,
  timeZone = "Asia/Manila",
) {
  return new Intl.DateTimeFormat("en-PH", {
    ...(includeWeekday ? { weekday: "long" as const } : {}),
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(eventAt));
}

export function formatScheduleRange(
  schedule: PublicSchedule,
  includeWeekday = true,
) {
  const timeZone = timeZoneFor(schedule);
  if (!schedule.ends_at) {
    return formatScheduleDate(schedule.event_at, includeWeekday, timeZone);
  }

  const start = new Date(schedule.event_at);
  const end = new Date(schedule.ends_at);
  const startParts = new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).formatToParts(start);
  const endParts = new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).formatToParts(end);
  const part = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value || "";
  const startMonth = part(startParts, "month");
  const startDay = part(startParts, "day");
  const startYear = part(startParts, "year");
  const endMonth = part(endParts, "month");
  const endDay = part(endParts, "day");
  const endYear = part(endParts, "year");
  const range =
    startMonth === endMonth && startYear === endYear
      ? `${startMonth} ${startDay}–${endDay}, ${startYear}`
      : `${startMonth} ${startDay}, ${startYear}–${endMonth} ${endDay}, ${endYear}`;
  const time = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(start);
  return `${range} at ${time}`;
}

export function scheduleOptionLabel(schedule: PublicSchedule) {
  const place = schedule.city || schedule.venue;
  return `${scheduleFlag(schedule)} ${formatScheduleRange(schedule, false)} · ${place}`;
}
