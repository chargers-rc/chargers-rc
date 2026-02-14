import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
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

function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDetails() {
  const { id, clubSlug } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setEvent(data);

      setLoading(false);
    }

    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center px-4 py-6">
        <div className="w-full max-w-xl">
          <p className="text-gray-600">Loading event…</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex justify-center px-4 py-6">
        <div className="w-full max-w-xl">
          <p className="text-gray-600">Event not found.</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const open = event.nominations_open ? new Date(event.nominations_open) : null;
  const close = event.nominations_close ? new Date(event.nominations_close) : null;

  const nominationsOpen =
    open && close && now >= open && now <= close;

  return (
    <div className="min-h-screen flex justify-center px-4 py-6">
      <div className="w-full max-w-xl space-y-6">

        {/* Event Logo */}
        {event.event_logo && (
          <div className="w-full h-44 rounded-md border border-gray-200 bg-white overflow-hidden flex items-center justify-center shadow-sm">
            <img
              src={event.event_logo}
              alt="Event Logo"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Event Name */}
        <h1 className="text-3xl font-bold leading-snug">
          {event.event_name || event.name}
        </h1>

        {/* Date */}
        <div className="text-gray-700 text-lg">
          {formatDate(event.event_date)}
        </div>

        {/* Track */}
        {event.track_type && (
          <div className="text-gray-700">
            <span className="font-semibold">Track:</span> {event.track_type}
          </div>
        )}

        {/* Classes */}
        {event.classes?.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Classes Racing</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              {event.classes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Description */}
        {event.description && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Event Details</h2>
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">
              {event.description}
            </p>
          </section>
        )}

        {/* Nomination Window */}
        {(event.nominations_open || event.nominations_close) && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Nominations</h2>
            <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm space-y-2">
              {event.nominations_open && (
                <div>
                  <span className="font-semibold">Opens:</span>{" "}
                  {formatDateTime(event.nominations_open)}
                </div>
              )}

              {event.nominations_close && (
                <div>
                  <span className="font-semibold">Closes:</span>{" "}
                  {formatDateTime(event.nominations_close)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Nominate Button */}
        <div className="pt-2">
          {nominationsOpen ? (
            <Link
              to={`/${clubSlug}/nominations/${event.id}/start`}
              className="block text-center py-3 bg-black text-white rounded-md font-semibold shadow-sm"
            >
              Nominate for this Event
            </Link>
          ) : (
            <div className="text-center py-3 bg-gray-300 text-gray-700 rounded-md font-semibold shadow-sm">
              Nominations Closed
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
