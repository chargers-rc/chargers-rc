import { useState } from "react";
import CMSCard from "@cms/CMSCard";
import CMSButton from "@cms/CMSButton";
import CMSToggle from "@cms/CMSToggle";
import CMSInput from "@cms/CMSInput";
import CMSTextarea from "@cms/CMSTextarea";
import CMSImageUpload from "@cms/CMSImageUpload";
import { supabase } from "@/supabaseClient";

export default function EventMerchandiseCard({ event, onChange }) {
  const [editingItem, setEditingItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const merchandise = event.merchandise || [];
  const classes = event.classes || [];

  const s = {
    str: (v) => (typeof v === "string" ? v : ""),
    num: (v) => (isNaN(Number(v)) ? 0 : Number(v)),
    arr: (v) => (Array.isArray(v) ? v : []),
  };

  const openNewItemDrawer = () => {
    setEditingItem({
      id: crypto.randomUUID(),
      name: "",
      description: "",
      price: 0,
      included: false,
      max_qty: 1,
      photo_file: null,
      photo_url: null,
      options: [],
      classes: [],
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item) => {
    setEditingItem({
      id: item.id,
      name: s.str(item.name),
      description: s.str(item.description),
      price: s.num(item.price),
      included: !!item.included,
      max_qty: s.num(item.max_qty),
      photo_file: null,
      photo_url: item.photo_url || null,
      options: s.arr(item.options).map((g) => ({
        name: s.str(g.name),
        values: s.arr(g.values).map((v) => s.str(v)),
      })),
      classes: s.arr(item.classes),
    });
    setDrawerOpen(true);
  };

const uploadPhoto = async (file) => {
  if (!file) return null;

  if (!event?.club_id) {
    console.error("Missing event.club_id for merch upload");
    return null;
  }

  // ⭐ Shared merch asset path (NO event ID, NO item ID)
  const path = `${event.club_id}/merch/${file.name}`;

  const { error } = await supabase.storage
    .from("club-assets")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Merch upload error:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("club-assets")
    .getPublicUrl(path);

  return data.publicUrl;
};

  const saveItem = async () => {
    let photoUrl = editingItem.photo_url;

    if (editingItem.photo_file instanceof File) {
      const url = await uploadPhoto(editingItem.photo_file);
      if (url) photoUrl = url;
    }

    const clean = {
      id: editingItem.id,
      name: s.str(editingItem.name),
      description: s.str(editingItem.description),
      price: s.num(editingItem.price),
      included: !!editingItem.included,
      max_qty: s.num(editingItem.max_qty),
      photo_url: photoUrl || null,
      options: s.arr(editingItem.options).map((g) => ({
        name: s.str(g.name),
        values: s.arr(g.values).map((v) => s.str(v)),
      })),
      classes: s.arr(editingItem.classes),
    };

    const updated = merchandise.filter((m) => m.id !== clean.id);
    updated.push(clean);

    onChange("merchandise", updated);

    setEditingItem(null);
    setDrawerOpen(false);
  };

  const deleteItem = (id) => {
    const updated = merchandise.filter((m) => m.id !== id);
    onChange("merchandise", updated);
  };

  const addOptionGroup = () => {
    setEditingItem((prev) => ({
      ...prev,
      options: [...prev.options, { name: "New Option Group", values: [] }],
    }));
  };

  const updateOptionGroupName = (index, name) => {
    const updated = [...editingItem.options];
    updated[index].name = s.str(name);
    setEditingItem((prev) => ({ ...prev, options: updated }));
  };

  const addOptionValue = (index, value) => {
    const updated = [...editingItem.options];
    updated[index].values.push(s.str(value));
    setEditingItem((prev) => ({ ...prev, options: updated }));
  };

  const removeOptionValue = (groupIndex, valueIndex) => {
    const updated = [...editingItem.options];
    updated[groupIndex].values.splice(valueIndex, 1);
    setEditingItem((prev) => ({ ...prev, options: updated }));
  };

  const removeOptionGroup = (index) => {
    const updated = [...editingItem.options];
    updated.splice(index, 1);
    setEditingItem((prev) => ({ ...prev, options: updated }));
  };

  const toggleClass = (classId) => {
    const current = s.arr(editingItem.classes);
    const exists = current.includes(classId);

    const updated = exists
      ? current.filter((c) => c !== classId)
      : [...current, classId];

    setEditingItem((prev) => ({ ...prev, classes: updated }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <CMSButton onClick={openNewItemDrawer}>Add Item</CMSButton>

      {merchandise.length === 0 && (
        <div style={{ padding: "8px 0", color: "#666" }}>
          No add‑ons configured.
        </div>
      )}

      {merchandise.map((item) => (
        <CMSCard key={item.id} title={s.str(item.name)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>{s.str(item.description)}</div>

            <div>
              {item.included
                ? "Included in entry"
                : `Price: $${s.num(item.price)}`}
            </div>

            <div>Max Qty: {s.num(item.max_qty)}</div>

            {s.arr(item.classes).length > 0 && (
              <div>
                <strong>Classes:</strong>{" "}
                {item.classes
                  .map((cid) => {
                    const cls = classes.find((c) => c.id === cid);
                    return cls ? cls.name : cid;
                  })
                  .join(", ")}
              </div>
            )}

            {s.arr(item.options).length > 0 && (
              <div>
                <strong>Options:</strong>
                {item.options.map((g) => (
                  <div key={g.name}>
                    {s.str(g.name)}: {s.arr(g.values).join(", ")}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <CMSButton onClick={() => openEditDrawer(item)}>Edit</CMSButton>
              <CMSButton variant="danger" onClick={() => deleteItem(item.id)}>
                Delete
              </CMSButton>
            </div>
          </div>
        </CMSCard>
      ))}

      {drawerOpen && editingItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "420px",
            height: "100vh",
            background: "#FFF",
            boxShadow: "-4px 0 12px rgba(0,0,0,0.15)",
            padding: "24px",
            overflowY: "auto",
            zIndex: 9999,
          }}
        >
          <CMSCard title="Edit Add‑On Item">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <CMSInput
                label="Name"
                value={s.str(editingItem.name)}
                onChange={(value) =>
                  setEditingItem((prev) => ({ ...prev, name: s.str(value) }))
                }
              />

              <CMSTextarea
                label="Description"
                value={s.str(editingItem.description)}
                onChange={(value) =>
                  setEditingItem((prev) => ({
                    ...prev,
                    description: s.str(value),
                  }))
                }
              />

              <CMSInput
                label="Price"
                type="number"
                value={String(s.num(editingItem.price))}
                onChange={(value) =>
                  setEditingItem((prev) => ({
                    ...prev,
                    price: s.num(value),
                  }))
                }
              />

              <CMSToggle
                label="Included in entry"
                checked={!!editingItem.included}
                onChange={(v) =>
                  setEditingItem((prev) => ({ ...prev, included: !!v }))
                }
              />

              <CMSInput
                label="Max Quantity"
                type="number"
                value={String(s.num(editingItem.max_qty))}
                onChange={(value) =>
                  setEditingItem((prev) => ({
                    ...prev,
                    max_qty: s.num(value),
                  }))
                }
              />

<CMSImageUpload
  label="Photo"
  value={editingItem.photo_url || null}        // ⭐ REQUIRED
  filePreview={editingItem.photo_file || null} // ⭐ ONLY File objects
  onChange={async (file) => {
    if (file === null) {
      setEditingItem((prev) => ({
        ...prev,
        photo_file: null,
        photo_url: null,
      }));
      return;
    }

    setEditingItem((prev) => ({
      ...prev,
      photo_file: file,
    }));

    const url = await uploadPhoto(file);
    if (url) {
      setEditingItem((prev) => ({
        ...prev,
        photo_url: url,
      }));
    }
  }}
/>

              <div>
                <strong>Classes this add‑on applies to:</strong>
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {classes.length === 0 && (
                    <div style={{ color: "#666" }}>
                      No classes configured for this event.
                    </div>
                  )}

                  {classes.map((cls) => (
                    <label
                      key={cls.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={editingItem.classes.includes(cls.id)}
                        onChange={() => toggleClass(cls.id)}
                      />
                      {cls.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>Option Groups</strong>
                  <CMSButton onClick={addOptionGroup}>Add Group</CMSButton>
                </div>

                {editingItem.options.map((group, gi) => (
                  <CMSCard
                    key={`${editingItem.id}-group-${gi}`}
                    title={s.str(group.name)}
                  >
                    <CMSInput
                      label="Group Name"
                      value={s.str(group.name)}
                      onChange={(value) => updateOptionGroupName(gi, value)}
                    />

                    <div style={{ marginTop: "8px" }}>
                      <strong>Values</strong>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        {group.values.map((val, vi) => (
                          <div
                            key={vi}
                            style={{
                              padding: "4px 10px",
                              background: "#EEE",
                              borderRadius: "20px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {s.str(val)}
                            <span
                              style={{
                                cursor: "pointer",
                                fontWeight: "bold",
                              }}
                              onClick={() => removeOptionValue(gi, vi)}
                            >
                              ×
                            </span>
                          </div>
                        ))}
                      </div>

                      <CMSInput
                        label="Add Value"
                        placeholder="e.g. Large"
                        onChange={(value) => addOptionValue(gi, value)}
                      />
                    </div>

                    <CMSButton
                      variant="danger"
                      onClick={() => removeOptionGroup(gi)}
                      style={{ marginTop: "12px" }}
                    >
                      Remove Group
                    </CMSButton>
                  </CMSCard>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <CMSButton onClick={saveItem}>Save Item</CMSButton>
                <CMSButton
                  variant="secondary"
                  onClick={() => setDrawerOpen(false)}
                >
                  Cancel
                </CMSButton>
              </div>
            </div>
          </CMSCard>
        </div>
      )}
    </div>
  );
}
