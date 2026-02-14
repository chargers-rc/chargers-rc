import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

import useProfile from "@app/hooks/useProfile";
import { COUNTRIES } from "@/data/countries";

export default function DriverProfile() {
  const { id, clubSlug } = useParams();
  const navigate = useNavigate();
  const { membership, user } = useProfile();

  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const isOwner =
    membership &&
    driver &&
    driver.membership_id === membership.id;

  // Non-members cannot view driver profiles
  const isMember = Boolean(membership);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("drivers")
        .select(`
          id,
          membership_id,
          first_name,
          last_name,
          is_junior,
          driver_profiles (
            nickname,
            team_name,
            country_code,
            avatar_url,
            about,
            sponsors,
            visible_in_directory,
            manufacturer
          )
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Driver not found.");
        setLoading(false);
        return;
      }

      const p = data.driver_profiles?.[0];

      setDriver(data);
      setProfile(p);
      setLoading(false);
    };

    load();
  }, [id]);

  // Access control
  if (!loading) {
    if (!isMember) {
      return (
        <div className="p-4 max-w-xl mx-auto">
          <Card className="p-6 text-center space-y-4">
            <h2 className="text-xl font-semibold">Members Only</h2>
            <p className="text-gray-600">
              Driver profiles are only visible to club members.
            </p>
            <Button onClick={() => navigate(`/${clubSlug}/profile/drivers`)}>
              Back to My Drivers
            </Button>
          </Card>
        </div>
      );
    }

    if (profile && !profile.visible_in_directory && !isOwner) {
      return (
        <div className="p-4 max-w-xl mx-auto">
          <Card className="p-6 text-center space-y-4">
            <h2 className="text-xl font-semibold">Driver Hidden</h2>
            <p className="text-gray-600">
              This driver is not visible in the directory.
            </p>
            <Button onClick={() => navigate(`/${clubSlug}/profile/drivers`)}>
              Back to My Drivers
            </Button>
          </Card>
        </div>
      );
    }
  }

  if (loading) return <div className="p-4">Loading driver…</div>;
  if (error) return <div className="p-4">{error}</div>;

  const country = COUNTRIES.find((c) => c.code === profile?.country_code);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Driver Profile
        </h1>

        {isOwner && (
          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/${clubSlug}/profile/drivers/${id}/edit`)
            }
          >
            Edit
          </Button>
        )}
      </div>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center space-y-4">
        <img
          src={profile.avatar_url || "/default-avatar.png"}
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover border"
        />

        <div>
          <h2 className="text-2xl font-semibold">
            {driver.first_name} {driver.last_name}
          </h2>

          {profile.nickname && (
            <p className="text-gray-600 text-lg">“{profile.nickname}”</p>
          )}

          {country && (
            <p className="text-gray-500 text-sm">
              {country.flag} {country.name}
            </p>
          )}
        </div>
      </div>

      {/* Team / Manufacturer */}
      {(profile.team_name || profile.manufacturer) && (
        <Card className="p-6 space-y-2">
          {profile.team_name && (
            <p className="text-gray-800">
              <span className="font-semibold">Team:</span> {profile.team_name}
            </p>
          )}

          {profile.manufacturer && (
            <p className="text-gray-800">
              <span className="font-semibold">Manufacturer:</span>{" "}
              {profile.manufacturer}
            </p>
          )}
        </Card>
      )}

      {/* Sponsors */}
      {profile.sponsors?.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Sponsors</h3>
          <div className="flex flex-wrap gap-2">
            {profile.sponsors.map((s) => (
              <Badge key={s} variant="blue">
                {s}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* About */}
      {profile.about && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">About</h3>
          <p className="text-gray-700 whitespace-pre-line">
            {profile.about}
          </p>
        </Card>
      )}

      {/* Social Links */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Social</h3>

        <p className="text-gray-500 text-sm">
          Social links coming soon.
        </p>
      </Card>
    </div>
  );
}
