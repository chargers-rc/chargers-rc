Chargers RC Platform — Architecture Overview

This document provides a clear, structured overview of the Chargers RC platform architecture. It explains how routing, providers, layouts, and context flow work together to create a stable, scalable application.

1. High-Level Architecture

The platform is built around React Router, Supabase, and a layered provider chain. Each provider handles a specific domain of data and exposes it through React context.

Router
 └── AuthProvider
      └── ProfileProvider
           └── MembershipProvider
                └── DriverProvider
                     └── ClubLayout
                          └── Pages (via <Outlet />)

This structure ensures that all pages receive consistent access to user, club, membership, and driver data.

2. Routing Structure

All club pages live under:

/club/:clubSlug

Examples:

/club/chargers-rc
/club/chargers-rc/login
/club/chargers-rc/membership
/club/chargers-rc/profile/drivers

This ensures:

ClubLayout loads the correct club

Pages receive club and user via useOutletContext()

The UI is always scoped to the selected club

3. ClubLayout

ClubLayout.jsx is the central layout for all club pages.

It:

Loads the club from Supabase

Loads the authenticated user

Sanitizes the club logo

Provides club and user to all pages

Renders the global header

Wraps pages in the provider chain

It must always return:

<Outlet context={{ club, user }} />

This is how pages access club and user data.

4. Provider Responsibilities

AuthProvider

Wraps Supabase auth

Exposes user, session, signIn, signOut

ProfileProvider

Loads the user’s profile row

Exposes profile fields (name, phone, etc.)

MembershipProvider

Loads membership status for the current club

Exposes membership tier, expiry, and permissions

DriverProvider

Loads driver profiles for the user

Exposes add/edit/delete driver functions

ClubProvider (legacy)

Previously loaded club data

Replaced by ClubLayout

5. Page Structure

Pages live under:

src/app/pages/

Examples:

home/Home.jsx
login/Login.jsx
membership/Membership.jsx
drivers/Drivers.jsx

Pages should:

Use useOutletContext() for club/user

Never import providers directly

Never import other pages directly

Never load data that a provider already supplies

6. Context Flow

AuthProvider → user
ProfileProvider → profile
MembershipProvider → membership
DriverProvider → driver_profiles
ClubLayout → club, user
Pages → useOutletContext()

If a page receives undefined context, the layout chain is broken.

7. Rules for Adding New Pages

Create the page under src/app/pages/...

Add a route under /club/:clubSlug/...

Do not import the page anywhere except routes.jsx

Use useOutletContext() for club/user

Use provider hooks for domain data

8. Common Failure Points

Rogue imports

A page imported directly instead of through routing.

Broken layout chain

ClubLayout not wrapping the route.

Infinite loops

useEffect depending on unstable values.

Old files still being hit

Outdated routes or duplicate pages.

9. Summary

The platform is built around:

A clean provider chain

A single ClubLayout

A stable routing structure

Pages that rely on context, not direct imports

This architecture ensures consistency, scalability, and maintainability across the entire app.