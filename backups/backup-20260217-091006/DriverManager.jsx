// src/app/pages/profile/DriverManager.jsx
import { Link, useOutletContext } from "react-router-dom";
import useDrivers from "@/app/hooks/useDrivers";
import useMembership from "@app/hooks/useMembership";
import { useNumbers } from "@/app/providers/NumberProvider";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function DriverManager() {
  const { club } = useOutletContext();

  const { drivers = [], loadingDrivers = true, error } = useDrivers();
  const {
    numbers,
    loadingNumbers,
    assignNumber,
    unassignNumber,
  } = useNumbers();

  const {
    loadingMembership,
    isFamily,
  } = useMembership();

  const clubSlug = club?.slug;

  const isLoading =
    loadingDrivers ||
    loadingNumbers ||
    (loadingMembership && (drivers?.length || 0) === 0);

  if (isLoading) {
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

  const hasDriver = (drivers || []).length > 0;
  const canAddDrivers = isFamily;

  // ------------------------------------------------------------
  // Helper: find the number assigned to a driver
  // ------------------------------------------------------------
  const getDriverNumber = (driverId) => {
    return numbers.find((n) => n.assigned_to_driver === driverId) || null;
  };

  // ------------------------------------------------------------
  // Helper: build dropdown options (Option B)
  // ------------------------------------------------------------
  const buildNumberOptions = (driverId) => {
    const current = getDriverNumber(driverId);

    const available = numbers.filter((n) => n.status === "available");

    const options = [];

    // Add current number first (if exists)
    if (current) {
      options.push({
        id: current.id,
        number: current.number,
        label: `${current.number} (current)`,
      });
    }

    // Add available numbers
    available.forEach((n) => {
      options.push({
        id: n.id,
        number: n.number,
        label: n.number.toString(),
      });
    });

    return options;
  };

  // ------------------------------------------------------------
  // Handle number change
  // ------------------------------------------------------------
  const handleNumberChange = async (driver, newNumberId) => {
    const current = getDriverNumber(driver.id);

    // If selecting the same number, do nothing
    if (current && current.id === newNumberId) return;

    // Unassign old number
    if (current) {
      await unassignNumber(current.id);
    }

    // Assign new number
    if (newNumberId) {
      await assignNumber(newNumberId, driver);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Driver Manager</h1>
        {canAddDrivers && clubSlug && (
          <Link to={`/${clubSlug}/profile/drivers/add`}>
            <Button variant="primary">Add Driver</Button>
          </Link>
        )}
      </div>

      {!hasDriver && (
        <Card className="p-6 text-center space-y-3">
          <p className="text-gray-600">You haven’t added any drivers yet.</p>
          {canAddDrivers && clubSlug && (
            <Link to={`/${clubSlug}/profile/drivers/add`}>
              <Button variant="primary">Add Your First Driver</Button>
            </Link>
          )}
        </Card>
      )}

      {hasDriver && (
        <div className="space-y-4">
          {drivers.map((driver) => {
            const currentNumber = getDriverNumber(driver.id);
            const options = buildNumberOptions(driver.id);

            return (
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
                      <p className="text-gray-600 text-sm">
                        “{driver.nickname}”
                      </p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {driver.is_junior && <Badge color="blue">Junior</Badge>}
                      {driver.driver_type && (
                        <Badge color="gray">{driver.driver_type}</Badge>
                      )}
                    </div>

                    {/* Number Picker */}
                    <div className="mt-2">
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={currentNumber?.id || ""}
                        onChange={(e) =>
                          handleNumberChange(driver, e.target.value)
                        }
                      >
                        <option value="">Select Number</option>
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/${clubSlug}/profile/drivers/${driver.id}/edit`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                  <Link to={`/${clubSlug}/profile/drivers/${driver.id}/delete`}>
                    <Button variant="danger">Delete</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
