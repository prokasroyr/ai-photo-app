import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import StatsCard from "../../components/dashboard/StatsCard";
import { Link } from "react-router-dom";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

function Dashboard() {
  const [profile, setProfile] = useState({
    photographerName: "",
    studioName: "",
    logo: "",
  });
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [processedPhotos, setProcessedPhotos] = useState(0);
  const [pendingPhotos, setPendingPhotos] = useState(0);
  const [progress, setProgress] = useState(0);
  const [events, setEvents] = useState([]);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("👤 Dashboard User:", user.uid);

      loadProfile(user);
      loadStats(user);
    } else {
      console.log("❌ No logged-in user");

      setProfile({
        photographerName: "",
        studioName: "",
        logo: "",
      });

      setTotalEvents(0);
      setTotalPhotos(0);
      setProcessedPhotos(0);
      setPendingPhotos(0);
      setProgress(0);
      setEvents([]);
    }
  });

  return () => unsubscribe();
}, []);
  const loadProfile = async (user) => {
  try {
    const docRef = doc(db, "settings", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setProfile(docSnap.data());
    } else {
      setProfile({
        photographerName: "",
        studioName: "",
        logo: "",
      });
    }
  } catch (error) {
    console.error("❌ Load Profile Error:", error);
  }
};

  const loadStats = async (user) => {
    try {
      console.log("👤 Logged-in UID:", user.uid);

      const eventQuery = query(
        collection(db, "events"),
        where("photographerId", "==", user.uid)
      );

      const eventSnap = await getDocs(eventQuery);
      console.log("📅 My Events:", eventSnap.size);

      setTotalEvents(eventSnap.size);

      const eventList = [];
      eventSnap.forEach((event) => {
        eventList.push({
          id: event.id,
          ...event.data(),
        });
      });

      setEvents(eventList);

      // শুধু current photographer-এর events-এর photos হিসাব করা
let allMyPhotos = [];

for (const event of eventList) {
  const photoQuery = query(
    collection(db, "photos"),
    where("eventId", "==", event.id)
  );

  const photoSnap = await getDocs(photoQuery);

  photoSnap.forEach((photoDoc) => {
    allMyPhotos.push({
      id: photoDoc.id,
      ...photoDoc.data(),
    });
  });
}

setTotalPhotos(allMyPhotos.length);

let processed = 0;
let pending = 0;

allMyPhotos.forEach((photo) => {
  if (photo.aiProcessed === true) {
    processed++;
  } else {
    pending++;
  }
});

setProcessedPhotos(processed);
setPendingPhotos(pending);

const total = processed + pending;

if (total > 0) {
  setProgress(Math.round((processed / total) * 100));
} else {
  setProgress(0);
}
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Welcome 👋</h1>
          <h2 className="text-2xl text-blue-600 mt-2">
            {profile.photographerName || "Photographer"}
          </h2>
          <p className="text-gray-500 mt-1">
            {profile.studioName || "Studio Name"}
          </p>
        </div>

        {profile.logo && (
          <img
            src={profile.logo}
            alt="Studio Logo"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
          />
        )}
      </div>

      {/* Create Event Button */}
      <div className="mb-8">
        <Link
          to="/events/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-block transition"
        >
          ➕ Create New Event
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Events"
          value={totalEvents}
          icon="📅"
          color="text-blue-500"
        />

        <StatsCard
          title="Total Photos"
          value={totalPhotos}
          icon="📷"
          color="text-green-500"
        />

        <StatsCard
          title="Clients"
          value="0"
          icon="👥"
          color="text-purple-500"
        />

        <StatsCard
          title="Storage"
          value="--"
          icon="☁️"
          color="text-orange-500"
        />

        <StatsCard
          title="AI Processed"
          value={processedPhotos}
          icon="🤖"
          color="text-emerald-500"
        />

        <StatsCard
          title="Pending AI"
          value={pendingPhotos}
          icon="⏳"
          color="text-red-500"
        />
      </div>

      {/* AI Processing Progress Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-xl p-6 mt-8">
        <h2 className="text-2xl font-bold mb-5">🤖 AI Processing Progress</h2>

        <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
          <div
            className="bg-green-500 h-5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-gray-600 gap-2">
          <p className="font-medium">
            {progress === 100
              ? "🎉 All Photos Processed"
              : "🤖 AI Processing Running..."}
          </p>
          <div className="flex gap-4 text-sm">
            <span>Processed: <b>{processedPhotos}</b></span>
            <span>Pending: <b>{pendingPhotos}</b></span>
            <span className="font-bold text-green-600">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Event Analytics Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-5">📅 Event Analytics</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="p-3">Event</th>
              <th className="p-3">Code</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
                  No events found.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{event.eventName}</td>
                  <td className="p-3 text-gray-600">{event.eventCode}</td>
                  <td className="p-3 text-gray-600">{event.eventDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;