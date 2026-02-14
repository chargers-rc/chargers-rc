import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Calendar() {
  const { clubSlug } = useParams();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [events, setEvents] = useState([]);
  const [calendarItems, setCalendarItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);

      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", start.toISOString())
        .lte("event_date", end.toISOString())
        .order("event_date", { ascending: true });

      const { data: calendarData } = await supabase
        .from("calendar")
        .select("*")
        .gte("calendar_date", start.toISOString())
        .lte("calendar_date", end.toISOString())
        .order("calendar_date", { ascending: true });

      setEvents(eventData || []);
      setCalendarItems(calendarData || []);
      setLoading(false);
    }

    loadData();
  }, [year, month]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);

  function itemsForDay(day) {
    if (!day) return [];

    const date = new Date(year, month, day).toISOString().slice(0, 10);

    const raceEvents = events.filter(
      (e) => e.event_date?.slice(0, 10) === date
    );

    const generalItems = calendarItems.filter(
      (c) => c.calendar_date?.slice(0, 10) === date
    );

    return [
      ...raceEvents.map((e) => ({
        id: e.id,
        type: "event",
        title: e.event_name || e.name
      })),
      ...generalItems.map((c) => ({
        id: c.id,
        type: c.type || "item",
        title: c.title
      }))
    ];
  }

  return (
    <div className="min-h-screen flex justify-center px-4 py-6">
      <div className="w-full max-w-xl">

        {/* Title */}
        <h1 className="text-2xl font-semibold mb-6">Calendar</h1>

        {/* Month Selector */}
        <div className="flex gap-2 mb-6">
          <select
            className="border border-gray-300 rounded-md p-2 bg-white"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-md p-2 bg-white"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = today.getFullYear() - 2 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>

        {loading && (
          <p className="text-gray-600">Loading calendar…</p>
        )}

        {!loading && (
          <div className="grid grid-cols-7 gap-2 text-center text-sm">

            {/* Weekday headers */}
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="font-semibold py-2">
                {d}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, i) => {
              const items = itemsForDay(day);

              return (
                <div
                  key={i}
                  className="
                    border border-gray-200 rounded-md min-h-24 p-2 text-left bg-white shadow-sm
                    flex flex-col
                  "
                >
                  {day && (
                    <div className="font-semibold mb-1">{day}</div>
                  )}

                  <div className="flex flex-col gap-1">
                    {items.map((item) => {
                      const isEvent = item.type === "event";

                      return (
                        <Link
                          key={item.id}
                          to={
                            isEvent
                              ? `/${clubSlug}/events/${item.id}`
                              : `/${clubSlug}/calendar/${item.id}`
                          }
                          className={`
                            text-xs underline
                            ${isEvent ? "text-blue-600" : "text-gray-700"}
                          `}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
