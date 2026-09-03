import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import EventDetails from "../pages/events/EventDetails";
import Dashboard from "../pages/dashboard/Dashboard";
import MyEvents from "../pages/events/MyEvents";
import GalleryPage from "../pages/gallery/GalleryPage";
import Settings from "../pages/settings/Settings";
import EditEvent from "../pages/events/EditEvent";
import CreateEvent from "../pages/admin/CreateEvent";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import SearchPhotos from "../pages/client/SearchPhotos";
import Home from "../pages/client/Home";
import MyPhotos from "../pages/client/MyPhotos";
import ClientHome from "../pages/client/ClientHome";
import UploadSelfie from "../pages/client/UploadSelfie";
import Searching from "../pages/client/Searching";
import Result from "../pages/client/Result";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ============================= */}
        {/* 🔐 PROTECTED PHOTOGRAPHER ROUTES */}
        {/* ============================= */}

        <Route element={<ProtectedRoute />}>

          <Route element={<DashboardLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/events/create"
              element={<CreateEvent />}
            />

            <Route
              path="/events"
              element={<MyEvents />}
            />

            <Route
              path="/events/edit/:id"
              element={<EditEvent />}
            />

            <Route
              path="/event/:id"
              element={<EventDetails />}
            />

            <Route
              path="/gallery"
              element={<GalleryPage />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

          </Route>

        </Route>


        {/* ============================= */}
        {/* 👤 CLIENT ROUTES */}
        {/* ============================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/client"
          element={<ClientHome />}
        />

        <Route
          path="/client/upload/:id"
          element={<UploadSelfie />}
        />

        <Route
          path="/client/search/:jobId"
          element={<Searching />}
        />

        <Route
          path="/client/result/:jobId"
          element={<Result />}
        />

        <Route
          path="/search"
          element={<SearchPhotos />}
        />

        <Route
          path="/my-photos"
          element={<MyPhotos />}
        />


        {/* ============================= */}
        {/* 🔑 AUTH ROUTES */}
        {/* ============================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;