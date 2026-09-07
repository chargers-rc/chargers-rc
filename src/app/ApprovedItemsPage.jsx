// src/app/approved-items/page.jsx

import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";

const TABS = ["batteries", "escs", "motors"];

export default function ApprovedItemsPage() {
  const [tab, setTab] = useState("batteries");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadItems() {
    setLoading(true);

    let table =
      tab === "batteries"
        ? "approved_batteries"
        : tab === "escs"
        ? "approved_escs"
        : "approved_motors";

    let query = supabase.from(table).select("*");

    if (search.trim()) {
      query = query.or(
        `brand.ilike.%${search}%,model.ilike.%${search}%`
      );
    }

    const { data, error } = await query.order("brand", {
      ascending: true,
    });

    if (error) console.error(error);

    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, [tab, search]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Approved RC Components</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 16px",
              background: tab === t ? "#333" : "#eee",
              color: tab === t ? "#fff" : "#000",
              borderRadius: 6,
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={`Search ${tab}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          marginBottom: 20,
          fontSize: 16,
        }}
      />

      {/* Results */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Model</th>
              {tab === "batteries" && <th>Capacity</th>}
              {tab === "escs" && <th>Amps</th>}
              {tab === "motors" && <th>KV</th>}
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.brand}</td>
                <td>{i.model}</td>
                {tab === "batteries" && <td>{i.capacity_mah}</td>}
                {tab === "escs" && <td>{i.amperage}</td>}
                {tab === "motors" && <td>{i.kv_rating}</td>}
                <td>{i.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
