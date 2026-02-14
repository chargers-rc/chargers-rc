import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clubSlug } = useParams();

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (!error && data) {
        setEvents(data);
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 font-poppins">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold mb-4">Events</h1>

      {/* LOADING STATE */}
      {loading && (
        <p className="text-gray-600">Loading events…</p>
      )}

      {/* EMPTY STATE */}
      {!loading && events.length === 0 && (
        <p className="text-gray-600">No events available. Check back soon.</p>
      )}

      {/* EVENTS LIST */}
      <div className="space-y-4">
        {events.map((event) => (
          <Link
            key={event.id}
            to={`/${clubSlug}/events/${event.id}`}
            className="
              block bg-white border border-gray-200 rounded-xl p-4 shadow-sm
              hover:shadow-md hover:-translate-y-0.5 transition-all
            "
          >
            <div className="flex gap-4 items-center">

              {/* EVENT LOGO */}
              {event.event_logo && (
                <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    src={event.event_logo}
                    alt="Event Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* TEXT CONTENT */}
              <div className="flex-1 space-y-1">
                <div className="text-lg font-semibold text-gray-900 leading-snug break-words">
                  {event.event_name || event.name}
                </div>

                <div className="text-gray-600 text-sm">
                  {formatDate(event.event_date)}
                </div>

                {event.track_type && (
                  <div className="text-gray-700 text-sm">
                    <span className="font-medium">Track:</span> {event.track_type}
                  </div>
                )}
              </div>

              {/* DETAILS BUTTON (desktop only) */}
              <div className="hidden sm:flex flex-shrink-0">
                <span className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
                  Details
                </span>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
