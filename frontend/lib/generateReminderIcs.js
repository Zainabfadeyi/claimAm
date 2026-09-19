function pad(n) {
  return String(n).padStart(2, "0");
}

function formatIcsTimestamp(date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function escapeIcsText(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// dateStr is "YYYY-MM-DD" from a <input type="date">. The event is written as a floating
// local time (no TZID/Z) so it lands at 9am on the device's own timezone, not UTC.
export function buildReminderIcs({ programId, programName, applyUrl, dateStr, note }) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const startLocal = `${year}${pad(month)}${pad(day)}T090000`;
  const endLocal = `${year}${pad(month)}${pad(day)}T093000`;
  const uid = `claimam-${programId}-${dateStr}@claimam.app`;

  const summary = escapeIcsText(`Apply: ${programName} (ClaimAm reminder)`);
  const descriptionParts = [note, `Apply here: ${applyUrl}`].filter(Boolean);
  const description = escapeIcsText(descriptionParts.join("\n\n"));

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClaimAm//Remind Me//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsTimestamp(new Date())}`,
    `DTSTART:${startLocal}`,
    `DTEND:${endLocal}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "TRIGGER:-PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

export function downloadIcsFile(icsContent, filename) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
