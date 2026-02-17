import { Routes, Route } from "react-router-dom";

import ClubLayout from "@app/providers/ClubLayout";
import ThemeProvider from "@app/providers/ThemeProvider.jsx";

import Login from "@app/pages/public/Login";
import Signup from "@app/pages/public/Signup";
import Welcome from "@app/pages/public/Welcome";
import Membership from "@app/pages/public/Membership";

import Home from "@app/pages/home/Home";

import Events from "@app/pages/events/Events";
import EventDetails from "@app/pages/events/EventDetails";

import Calendar from "@app/pages/events/Calendar";
import CalendarItemDetails from "@app/pages/events/CalendarItemDetails";

import UserProfile from "@app/pages/profile/UserProfile";
import DriverManager from "@app/pages/profile/DriverManager";
import DriverProfile from "@app/pages/profile/DriverProfile";
import AddDriver from "@app/pages/profile/AddDriver";
import EditDriver from "@app/pages/profile/EditDriver";

export default function RoutesFile() {
  return (
    <Routes>
      <Route
        path="/:clubSlug/*"
        element={
          <ThemeProvider>
            <ClubLayout />
          </ThemeProvider>
        }
      >
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="welcome" element={<Welcome />} />
        <Route index element={<Home />} />
        <Route path="membership" element={<Membership />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="calendar/:id" element={<CalendarItemDetails />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="profile/drivers" element={<DriverManager />} />
        <Route path="profile/drivers/add" element={<AddDriver />} />
        <Route path="profile/drivers/:id/edit" element={<EditDriver />} />
        <Route path="profile/drivers/:id" element={<DriverProfile />} />
      </Route>

      <Route path="*" element={<div>Page not found.</div>} />
    </Routes>
  );
}
