// src/app/pages/profile/DriverManager.jsx
import { Link, useOutletContext } from "react-router-dom";
import useDrivers from "@/app/hooks/useDrivers";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function DriverManager() {
  const { club, membership } = useOutletContext();
  const membershipId = membership?.id;

  const { drivers, loading, error } = useDrivers(membershipId);

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-gray-600">Loading drivers…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-red-600">Error loading drivers.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Driver Manager</h1>

        {/* Only show Add Driver button when drivers exist AND club.slug is ready */}
        {drivers.length > 0 && club?.slug && (
          <Link to={`/${club.slug}/profile/drivers/add`}>
            <Button variant="primary">Add Driver</Button>
          </Link>
        )}
      </div>

      {/* Empty State */}
      {drivers.length === 0 && club?.slug && (
        <Card className="p-6 text-center space-y-3">
          <p className="text-gray-600">You haven’t added any drivers yet.</p>
          <Link to={`/${club.slug}/profile/drivers/add`}>
            <Button variant="primary">Add Your First Driver</Button>
          </Link>
        </Card>
      )}

      {/* Driver List */}
      <div className="space-y-4">
        {drivers.map((driver) => (
          <Card
            key={driver.id}
            className="p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={driver.avatar_url || "/default-avatar.png"}
                alt="Driver avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">
                  {driver.first_name} {driver.last_name}
                </p>
                {driver.nickname && (
                  <p className="text-gray-600 text-sm">“{driver.nickname}”</p>
                )}
                <div className="flex gap-2 mt-1">
                  {driver.is_junior && <Badge color="blue">Junior</Badge>}
                  {driver.driver_type && (
                    <Badge color="gray">{driver.driver_type}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link to={`/${club.slug}/profile/drivers/${driver.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Link to={`/${club.slug}/profile/drivers/${driver.id}/delete`}>
                <Button variant="danger">Delete</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
