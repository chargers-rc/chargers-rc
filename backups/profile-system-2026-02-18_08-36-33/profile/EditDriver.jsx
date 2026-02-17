// src/app/pages/profile/EditDriver.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Textarea from "@/components/ui/Textarea";

import { useDrivers } from "@/app/providers/DriverProvider";

export default function EditDriver() {
  const { driverId, clubSlug } = useParams();
  const navigate = useNavigate();

  const { drivers, loadingDrivers } = useDrivers();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [teamName, setTeamName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [about, setAbout] = useState("");
  const [isJunior, setIsJunior] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (loadingDrivers) return;

    const driver = drivers.find((d) => String(d.id) === String(driverId));

    if (!driver) {
      setError("Driver not found.");
      setLoading(false);
      return;
    }

    const profile = driver.profile || {};

    setFirstName(driver.first_name || "");
    setLastName(driver.last_name || "");
    setNickname(profile.nickname || "");
    setTeamName(profile.team_name || "");
    setManufacturer(profile.manufacturer || "");
    setAbout(profile.about || "");
    setIsJunior(!!driver.is_junior);
    setVisible(
      typeof profile.visible_in_directory === "boolean"
        ? profile.visible_in_directory
        : true
    );

    setLoading(false);
  }, [driverId, drivers, loadingDrivers]);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      if (saving) return;

      setSaving(true);
      setError("");

      try {
        const driverPayload = {
          first_name: firstName,
          last_name: lastName,
          is_junior: isJunior,
        };

        const { error: driverUpdateError } = await supabase
          .from("drivers")
          .update(driverPayload)
          .eq("id", driverId);

        if (driverUpdateError) {
          setError("Failed to save driver.");
          setSaving(false);
          return;
        }

        const profilePayload = {
          driver_id: driverId,
          nickname,
          team_name: teamName,
          manufacturer,
          about,
          visible_in_directory: visible,
        };

        const { error: profileUpsertError } = await supabase
          .from("driver_profiles")
          .upsert(profilePayload, { onConflict: "driver_id" });

        if (profileUpsertError) {
          setError("Failed to save profile.");
          setSaving(false);
          return;
        }

        navigate(`/${clubSlug}/profile/drivers`);
      } catch (err) {
        console.error("Save error:", err);
        setError("Unexpected error saving driver.");
      } finally {
        setSaving(false);
      }
    },
    [
      driverId,
      firstName,
      lastName,
      isJunior,
      nickname,
      teamName,
      manufacturer,
      about,
      visible,
      navigate,
      clubSlug,
      saving,
    ]
  );

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-gray-600">Loading driver…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Edit Driver</h1>
          <Button
            variant="secondary"
            onClick={() => navigate(`/${clubSlug}/profile/drivers`)}
          >
            Back
          </Button>
        </div>

        {error && <p className="text-red-600 font-medium">{error}</p>}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <Input
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            label="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <Input
            label="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />

          <Input
            label="Manufacturer"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          />

          <div>
            <Label>About</Label>
            <Textarea
              rows={5}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isJunior}
                onChange={(e) => setIsJunior(e.target.checked)}
              />
              Junior
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
              />
              Visible in directory
            </label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/${clubSlug}/profile/drivers`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
