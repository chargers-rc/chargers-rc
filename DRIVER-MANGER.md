Driver Manager — Troubleshooting & Architecture

Driver Manager is one of the most complex and sensitive parts of the Chargers RC platform. This document explains how it works, why it breaks, and how to debug it safely and consistently.

1. Purpose of Driver Manager

Driver Manager allows users to:

View all of their driver profiles

Add new drivers

Edit existing drivers

Delete drivers

Sync changes with Supabase in real time

It depends on the following providers:

AuthProvider — supplies the authenticated user

ProfileProvider — supplies the user profile

MembershipProvider — supplies membership status

DriverProvider — supplies driver profiles and CRUD functions

ClubLayout — supplies club and user via useOutletContext()

Driver Manager must run inside the full provider chain.

2. File Structure

The Driver Manager page lives here:

src/app/pages/drivers/Drivers.jsx

Supporting pages may include:

AddDriver.jsx
EditDriver.jsx
DriverCard.jsx

Old or duplicate versions of these files are the #1 cause of routing and rendering bugs.

3. Common Failure Modes

1. Infinite Render Loop

Cause:

A useEffect depends on driver_profiles

The effect sets state that changes driver_profiles

Fix:

Guard effects

Normalize data shape

Add logs to confirm effect frequency

2. Rogue Import

Cause:

A page imports another page directly

A component imports a page

A file uses export * from a pages folder

Fix:

Search for:

import *

export *

direct imports of pages

Remove them

3. Wrong File Being Hit

Cause:

Old AddDriver/EditDriver files still exist

Old routes still exist

React Router loads the wrong version

Fix:

Add logs:

console.log("DRIVER MANAGER FILE LOADED");

Delete old files

Restart Vite

4. Layout Chain Broken

Cause:

ClubLayout not wrapping the route

Route path incorrect

Page not nested under /club/:clubSlug

Fix:

Confirm route:

/club/:clubSlug/profile/drivers

Confirm <Outlet /> exists in ClubLayout

5. Data Shape Mismatch

Cause:

Supabase returns null

Code expects an array

Spreading undefined

Fix:

const drivers = driver_profiles || [];

4. Debugging Checklist (Fast)

Add logs:

console.log("DRIVER MANAGER LOADED");
console.log("driver_profiles:", driver_profiles);

Check if the file logs at all

If not → wrong file being hit

Check if logs fire repeatedly

If yes → infinite loop

Check if driver_profiles is undefined

If yes → provider chain broken

Check if the page loads before ClubLayout

If yes → rogue import

5. Rules for Driver Manager Stability

Never import pages directly

Never duplicate AddDriver/EditDriver files

Always use provider hooks

Always use useOutletContext() for club/user

Keep effects guarded and stable

Delete old routes when replacing pages

6. Summary

Driver Manager is stable when:

The correct file is being used

The provider chain is intact

Effects are guarded

No rogue imports exist

No old files exist

Follow this guide to keep Driver Manager predictable and reliable.