import useMembership from "../hooks/useMembership";

export default function MembershipStatusCard() {
  const {
    membership,
    loadingMembership,
    isExpired,
    expiresSoon,
    renewMembership,
    refreshMembership,
  } = useMembership();


  if (loadingMembership) {
    return (
      <div className="p-4 rounded-lg bg-gray-100 animate-pulse">
        Loading membership…
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="p-4 rounded-lg bg-red-100 text-red-700">
        No membership found.
      </div>
    );
  }

  const expiry = new Date(membership.expires_at).toLocaleDateString();

  const handleRenew = async () => {
    await renewMembership();
    refreshMembership();
    notify("Membership renewed successfully", "success");
  };

  return (
    <div className="p-6 rounded-xl bg-white shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-2">Membership Status</h2>

      <p className="text-gray-600 mb-4">
        Expires on <span className="font-medium">{expiry}</span>
      </p>

      {isExpired && (
        <div className="p-3 mb-4 rounded-lg bg-red-100 text-red-700">
          Your membership has expired.
        </div>
      )}

      {!isExpired && expiresSoon && (
        <div className="p-3 mb-4 rounded-lg bg-yellow-100 text-yellow-700">
          Your membership expires soon.
        </div>
      )}

      <button
        onClick={handleRenew}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Renew Membership
      </button>
    </div>
  );
}
