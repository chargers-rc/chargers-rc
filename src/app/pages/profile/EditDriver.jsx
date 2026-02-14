import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Textarea from "@/components/ui/Textarea";
import SponsorTagInput from "@/components/SponsorTagInput";

import { COUNTRIES } from "@/data/countries";

export default function EditDriver() {
  const { id, clubSlug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Driver table fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isJunior, setIsJunior] = useState(false);

  // Profile table fields
  const [nickname, setNickname] = useState("");
  const [teamName, setTeamName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [about, setAbout] = useState("");
  const [sponsors, setSponsors] = useState([]);
  const [countryCode, setCountryCode] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [visible, setVisible] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");

      // 1) Load driver
      const {
        data: driver,
        error: driverError,
      } = await supabase
        .from("drivers")
        .select("id, first_name, last_name, is_junior")
        .eq("id", id)
        .single();

      if (driverError || !driver) {
        setError("Driver not found.");
        setLoading(false);
        return;
      }

      setFirstName(driver.first_name || "");
      setLastName(driver.last_name || "");
      setIsJunior(!!driver.is_junior);

      // 2) Load profile (one-to-one)
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("driver_profiles")
        .select(
          `
          nickname,
          team_name,
          country_code,
          avatar_url,
          about,
          sponsors,
          visible_in_directory,
          manufacturer
        `
        )
        .eq("driver_id", id)
        .maybeSingle(); // ← safe: null if none

      if (!profileError && profile) {
        setNickname(profile.nickname || "");
        setTeamName(profile.team_name || "");
        setCountryCode(profile.country_code);
        setAvatarUrl(profile.avatar_url);
        setAbout(profile.about || "");
        setSponsors(profile.sponsors || []);
        setVisible(
          typeof profile.visible_in_directory === "boolean"
            ? profile.visible_in_directory
            : true
        );
        setManufacturer(profile.manufacturer || "");
      }

      setLoading(false);
    };

    load();
  }, [id]);

  const handleAvatarUpload = async (file) => {
    if (!file || !id) return;

    const ext = file.name.split(".").pop();
    const path = `${id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("driver_avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Failed to upload avatar.");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("driver_avatars")
      .getPublicUrl(path);

    setAvatarUrl(urlData.publicUrl);
  };

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    setError("");

    const { error: driverError } = await supabase
      .from("drivers")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        is_junior: isJunior,
      })
      .eq("id", id);

    if (driverError) {
      setError("Failed to update driver.");
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("driver_profiles")
      .update({
        nickname,
        team_name: teamName,
        country_code: countryCode,
        avatar_url: avatarUrl,
        about,
        sponsors,
        visible_in_directory: visible,
        manufacturer,
      })
      .eq("driver_id", id);

    if (profileError) {
      setError("Failed to update driver profile.");
      setSaving(false);
      return;
    }

    navigate(`/${clubSlug}/profile/drivers/${id}`);
  };

  if (loading) return <div className="p-4">Loading driver…</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Driver</h1>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Identity */}
      <Card className="p-6 space-y-6">
        <h2 className="text-lg font-semibold">Identity</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl || "/default-avatar.png"}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border"
          />

          <div>
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </Button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => handleAvatarUpload(e.target.files[0])}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>First Name</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div>
            <Label>Last Name</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isJunior}
              onChange={(e) => setIsJunior(e.target.checked)}
            />
            Junior Driver
          </label>

          <div>
            <Label>Country</Label>
            <select
              className="w-full border rounded-md p-2"
              value={countryCode || ""}
              onChange={(e) => setCountryCode(e.target.value || null)}
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Profile */}
      <Card className="p-6 space-y-6">
        <h2 className="text-lg font-semibold">Profile</h2>

        <div className="space-y-4">
          <div>
            <Label>Nickname</Label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div>
            <Label>Team Name</Label>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>

          <div>
            <Label>Manufacturer</Label>
            <Input
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            />
          </div>

          <div>
            <Label>Sponsors</Label>
            <SponsorTagInput value={sponsors} onChange={setSponsors} />
          </div>

          <div>
            <Label>About</Label>
            <Textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Social Links */}
      <Card className="p-6 space-y-6">
        <h2 className="text-lg font-semibold">Social Links</h2>

        <div className="space-y-4">
          <div>
            <Label>Instagram</Label>
            <Input
              value=""
              onChange={() => {}}
              placeholder="Coming soon"
              disabled
            />
          </div>

          <div>
            <Label>Facebook</Label>
            <Input
              value=""
              onChange={() => {}}
              placeholder="Coming soon"
              disabled
            />
          </div>

          <div>
            <Label>TikTok</Label>
            <Input
              value=""
              onChange={() => {}}
              placeholder="Coming soon"
              disabled
            />
          </div>

          <div>
            <Label>YouTube</Label>
            <Input
              value=""
              onChange={() => {}}
              placeholder="Coming soon"
              disabled
            />
          </div>

          <div>
            <Label>Website</Label>
            <Input
              value=""
              onChange={() => {}}
              placeholder="Coming soon"
              disabled
            />
          </div>
        </div>
      </Card>

      {/* Visibility */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Visibility</h2>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
          />
          Visible in Racer Directory
        </label>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
