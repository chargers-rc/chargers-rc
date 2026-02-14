import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import useTheme from "@app/providers/useTheme";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminEvents() {
  const { clubSlug } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    async function load() {
      const { data: eventRows, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const { data: nomRows } = await supabase
        .from("nominations")
        .select("event_id");

      const counts = {};
      (nomRows || []).forEach((n) => {
        counts[n.event_id] = (counts[n.event_id] || 0) + 1;
      });

      const enriched = (eventRows || []).map((ev) => ({
        ...ev,
        nomination_count: counts[ev.id] || 0,
      }));

      setEvents(enriched);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight"
            style={{ color: theme.colors.primary }}
          >
            Admin — Events
          </h1>

          <Link
            to={`/${clubSlug}/admin/events/new`}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 text-slate-950 px-5 py-2.5 text-sm font-semibold hover:bg-emerald-400 transition-colors"
          >
            + Add Event
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex items-center gap-3 text-slate-300">
            <div className="h-5 w-5 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
            <p>Loading events…</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && events.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
            <p className="text-slate-400 text-sm">No events found.</p>
          </div>
        )}

        {/* EVENT LIST */}
        <div className="space-y-4">
          {events.map((event) => {
            const isOpen = event.is_open;
            const statusColor = isOpen
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-red-500/20 text-red-300 border-red-500/30";

            return (
              <div
                key={event.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between"
              >
                {/* LEFT SIDE */}
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-slate-50">
                    {event.name}
                  </p>

                  <p className="text-sm text-slate-400">
                    {formatDate(event.event_date)}
                  </p>

                  {event.track && (
                    <p className="text-xs text-slate-400">
                      Track: {event.track}
                    </p>
                  )}

                  <p className="text-xs text-slate-400">
                    Nominations:{" "}
                    <span className="text-slate-200 font-semibold">
                      {event.nomination_count}
                    </span>
                  </p>

                  {/* STATUS BADGE */}
                  {event.is_open !== undefined && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}
                    >
                      {isOpen ? "Open" : "Closed"}
                    </span>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col items-end gap-2">
                  <Link
                    to={`/${clubSlug}/admin/events/${event.id}`}
                    className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Edit
                  </Link>

                  <Link
                    to={`/${clubSlug}/admin/events/${event.id}/nominations`}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    View Nominations
                  </Link>

                  <Link
                    to={`/${clubSlug}/admin/events/${event.id}/classes`}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Manage Classes
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
