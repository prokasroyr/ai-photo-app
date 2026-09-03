import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { Link } from "react-router-dom";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        console.log("❌ No logged-in user");
        setEvents([]);
        setLoading(false);
        return;
      }

      console.log("👤 Logged-in UID:", user.uid);

      // শুধু বর্তমান photographer-এর events
      const q = query(
        collection(db, "events"),
        where("photographerId", "==", user.uid)
      );

      const snap = await getDocs(q);

      console.log("📅 My Events:", snap.size);

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
    const ok = window.confirm("Delete this event?");

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "events", id));

      alert("✅ Event Deleted");

      loadEvents();
    } catch (error) {
      console.error("❌ Delete Event Error:", error);
      alert("Delete Failed");
    }
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          📅 My Events
        </h1>

        <Link
          to="/events/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
        >
          ➕ Create Event
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (

        // No Events
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            📅 No events found.
          </p>

          <Link
            to="/events/create"
            className="inline-block mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            ➕ Create Your First Event
          </Link>
        </div>

      ) : (

        // Events
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow p-5"
            >

              <h2 className="text-xl font-bold">
                {event.eventName}
              </h2>

              <p className="mt-2">
                📅 {event.eventDate}
              </p>

              <p>
                📍 {event.location}
              </p>

              <p className="text-blue-600 font-semibold mt-1">
                🎟️ {event.eventCode}
              </p>

              <div className="flex gap-3 mt-5">

                <Link
                  to={`/event/${event.id}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  View
                </Link>

                <Link
                  to={`/events/edit/${event.id}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                >
                  Edit
                </Link>

                <button
                  onClick={() => deleteEvent(event.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
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