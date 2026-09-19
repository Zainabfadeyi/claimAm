import { useState } from "react";
import { buildReminderIcs, downloadIcsFile } from "../lib/generateReminderIcs";

export default function RemindMeCard({ programId, programName, applyUrl, statusNote }) {
  const [date, setDate] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  function handleDownload(e) {
    e.preventDefault();
    if (!date) return;

    const ics = buildReminderIcs({
      programId,
      programName,
      applyUrl,
      dateStr: date,
      note: statusNote,
    });
    downloadIcsFile(ics, `claimam-${programId}-reminder.ics`);
    setDownloaded(true);
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">⏰ Remind me to apply</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Pick a date and ClaimAm generates a calendar file with a reminder built in — add it to
        your phone or computer&apos;s calendar app. No account, no email: the file only ever
        exists on your device.
      </p>

      {statusNote && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {statusNote}
        </p>
      )}

      <form onSubmit={handleDownload} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setDownloaded(false);
          }}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={!date}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download reminder (.ics)
        </button>
      </form>

      {downloaded && (
        <p className="mt-2 text-xs font-medium text-brand-700">
          Downloaded — open the file to add it to your calendar.
        </p>
      )}
    </div>
  );
}
