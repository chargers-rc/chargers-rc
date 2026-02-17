// src/app/pages/profile/DriverManager.jsx
import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useDrivers } from "@/app/providers/DriverProvider";
import { useNumbers } from "@/app/providers/NumberProvider";
import useMembership from "@/app/hooks/useMembership";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

function SimpleSpinner() {
  return (
    <div className="p-6 max-w-3xl mx-auto" aria-live="polite">
      <p className="text-gray-600">Loading drivers…</p>
    </div>
  );
}

export default function DriverManager() {
  const { club } = useOutletContext();
  const clubSlug = club?.slug;

  const { drivers = [], loadingDrivers = true, error } = useDrivers();
  const {
    numbers,
    loadingNumbers,
    assignNumber,
    unassignNumber,
  } = useNumbers();
  const { loadingMembership, isFamily } = useMembership();

  const hasDrivers = drivers.length > 0;

  // Stable loading logic (no flip-flop on hasDrivers)
  const isLoading =
    loadingDrivers ||
    loadingNumbers ||
    loadingMembership;

  if (isLoading) {
    return <SimpleSpinner />;
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-red-600">Error loading drivers.</p>
      </div>
    );
  }

  const canAddDrivers = isFamily;

  const getDriverNumber = (driverId) => {
    if (!numbers || numbers.length === 0) return null;
    return numbers.find((n) => n.assigned_to_driver === driverId) || null;
  };

  const buildNumberOptions = (driverId) => {
    const current = getDriverNumber(driverId);
    const available = (numbers || []).filter(
      (n) => n.status === "available"
    );

    const options = [];

    if (current) {
      options.push({
        id: current.id,
        number: current.number,
        label: `${current.number} (current)`,
      });
    }

    available.forEach((n) => {
      options.push({
        id: n.id,
        number: n.number,
        label: n.number.toString(),
      });
    });

    return options;
  };

  const handleNumberChange = async (driver, newNumberId) => {
    const current = getDriverNumber(driver.id);

    if (current && current.id === newNumberId) return;

    if (current) {
      await unassignNumber(current.id);
    }

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

      {!hasDrivers && (
        <Card className="p-6 text-center space-y-3">
          <p className="text-gray-600">You haven’t added any drivers yet.</p>
          {canAddDrivers && clubSlug && (
            <Link to={`/${clubSlug}/profile/drivers/add`}>
              <Button variant="primary">Add Your First Driver</Button>
            </Link>
          )}
        </Card>
      )}

      {hasDrivers && (
        <div className="space-y-4">
          {drivers.map((driver) => {
            const profile = driver.profile || {};
            const avatar =
              profile.avatar_url ||
              driver.avatar_url ||
              "/default-avatar.png";
            const nickname = profile.nickname || driver.nickname;
            const currentNumber = getDriverNumber(driver.id);
            const options = buildNumberOptions(driver.id);

            return (
              <Card
                key={driver.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={avatar}
                    alt="Driver avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">
                      {driver.first_name} {driver.last_name}
                    </p>
                    {nickname && (
                      <p className="text-gray-600 text-sm">“{nickname}”</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {driver.is_junior && <Badge color="blue">Junior</Badge>}
                      {driver.driver_type && (
                        <Badge color="gray">{driver.driver_type}</Badge>
                      )}
                    </div>

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
                  {clubSlug && (
                    <>
                      <Link
                        to={`/${clubSlug}/profile/drivers/${driver.id}/edit`}
                      >
                        <Button variant="secondary">Edit</Button>
                      </Link>
                      <Link
                        to={`/${clubSlug}/profile/drivers/${driver.id}/delete`}
                      >
                        <Button variant="danger">Delete</Button>
                      </Link>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
