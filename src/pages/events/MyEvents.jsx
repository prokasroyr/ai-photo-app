import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../services/firebase";
import { Link } from "react-router-dom";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Firebase Auth স্টেট চেঞ্জের জন্য ওয়াচ করা
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadEvents(user.uid);
      } else {
        console.log("❌ No logged-in user");
        setEvents([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadEvents = async (uid) => {
    try {
      setLoading(true);

      console.log("👤 Logged-in UID:", uid);

      // শুধু বর্তমান photographer-এর events ফেচ করা
      const q = query(
        collection(db, "events"),
        where("photographerId", "==", uid)
      );

      const snap = await getDocs(q);

      console.log("📅 My Events Count:", snap.size);

      const list = [];
      snap.forEach((eventDoc) => {
        list.push({
          id: eventDoc.id,
          ...eventDoc.data(),
        });
      });

      setEvents(list);
    } catch (error) {
      console.error("❌ Load Events Error:", error);
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this event?");

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "events", id));

      // UI থেকে তাৎক্ষণিকভাবে রিমুভ করা
      setEvents((prev) => prev.filter((item) => item.id !== id));
      alert("✅ Event Deleted");
    } catch (error) {
      console.error("❌ Delete Event Error:", error);
      alert("Delete Failed");
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📅 My Events</h1>

        <Link
          to="/events/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition"
        >
          ➕ Create Event
        </Link>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20 font-semibold text-gray-500 animate-pulse">
          Loading your events...
        </div>
      ) : events.length === 0 ? (
        /* No Events State */
        <div className="bg-white rounded-xl shadow p-8 text-center border">
          <p className="text-gray-500 text-lg font-medium">
            📅 No events found.
          </p>

          <Link
            to="/events/create"
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition"
          >
            ➕ Create Your First Event
          </Link>
        </div>
      ) : (
        /* Events Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow border p-5 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {event.eventName || "Untitled Event"}
                </h2>

                <p className="mt-2 text-gray-600 text-sm">
                  📅 {event.eventDate || "Date not set"}
                </p>

                <p className="text-gray-600 text-sm">
                  📍 {event.location || "Location not set"}
                </p>

                <p className="text-blue-600 font-mono font-semibold mt-2 bg-blue-50 px-2 py-1 rounded inline-block text-sm">
                  🎟️ {event.eventCode || "N/A"}
                </p>
              </div>

              <div className="flex gap-2 mt-5 pt-3 border-t">
                <Link
                  to={`/event/${event.id}`}
                  className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium text-sm transition"
                >
                  View
                </Link>

                <Link
                  to={`/events/edit/${event.id}`}
                  className="flex-1 text-center bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded font-medium text-sm transition"
                >
                  Edit
                </Link>

                <button
                  onClick={() => deleteEvent(event.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium text-sm transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyEvents;