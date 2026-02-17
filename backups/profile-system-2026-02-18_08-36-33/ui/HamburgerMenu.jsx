import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import useProfile from "@app/hooks/useProfile";

export default function HamburgerMenu() {
  const { clubSlug } = useParams();
  const { profile } = useProfile();
  const isAdmin = profile?.is_admin === true;

  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* Hamburger Icon */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-md border border-gray-300 bg-white shadow-sm"
      >
        <div className="space-y-1">
          <div className="w-5 h-0.5 bg-black"></div>
          <div className="w-5 h-0.5 bg-black"></div>
          <div className="w-5 h-0.5 bg-black"></div>
        </div>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[70%] max-w-xs bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-6">

          {/* Account */}
          <div className="space-y-3">
            <Link
              to={`/${clubSlug}/profile`}
              onClick={closeMenu}
              className="block text-gray-900 text-base"
            >
              User Profile
            </Link>

            <Link
              to={`/${clubSlug}/profile/drivers`}
              onClick={closeMenu}
              className="block text-gray-900 text-base"
            >
              Driver Manager
            </Link>

            <Link
              to={`/${clubSlug}/notifications`}
              onClick={closeMenu}
              className="block text-gray-900 text-base"
            >
              Notification Settings
            </Link>

            <Link
              to={`/${clubSlug}/settings`}
              onClick={closeMenu}
              className="block text-gray-900 text-base"
            >
              Settings
            </Link>
          </div>

          {/* Club */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <Link
              to={`/${clubSlug}/membership`}
              onClick={closeMenu}
              className="block text-gray-900 text-base"
            >
              Membership
            </Link>

            <Link
              to={`/${clubSlug}/calendar`}
              onClick={closeMenu}
              className="block text-gray-900 text-base"
            >
              Calendar
            </Link>

            <Link
              to={`/${clubSlug}/events`}
              onClick={closeMenu}
              className="block text-gray-900 text-base"
            >
              Events
            </Link>
          </div>

          {/* Admin */}
          {isAdmin && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Link
                to={`/${clubSlug}/admin/events`}
                onClick={closeMenu}
                className="block text-gray-900 text-base"
              >
                Event Manager
              </Link>

              <Link
                to={`/${clubSlug}/admin/calendar`}
                onClick={closeMenu}
                className="block text-gray-900 text-base"
              >
                Calendar Manager
              </Link>

              <Link
                to={`/${clubSlug}/admin/membership`}
                onClick={closeMenu}
                className="block text-gray-900 text-base"
              >
                Membership Manager
              </Link>

              <Link
                to={`/${clubSlug}/admin/news`}
                onClick={closeMenu}
                className="block text-gray-900 text-base"
              >
                News Panel
              </Link>

              <Link
                to={`/${clubSlug}/admin/settings`}
                onClick={closeMenu}
                className="block text-gray-900 text-base"
              >
                Club Settings
              </Link>
            </div>
          )}

          {/* Logout */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                closeMenu();
                supabase.auth.signOut();
                window.location.reload();
              }}
              className="text-red-600 text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
