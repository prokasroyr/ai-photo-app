import { Link, useNavigate } from "react-router-dom";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";

function EventCard({ event }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${event.eventName}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "events", event.id));

      alert("✅ Event Deleted Successfully");

      navigate("/events");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to Delete Event");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
      <h2 className="text-2xl font-bold">
        💍 {event.eventName}
      </h2>

      <p className="text-gray-500 mt-2">
        📅 {event.eventDate}
      </p>

      <p className="text-gray-500">
        📍 {event.location}
      </p>

      <p className="text-blue-600 font-semibold mt-2">
        🆔 {event.eventCode}
      </p>

      <div className="flex gap-3 mt-5">
        <Link
          to={`/event/${event.id}`}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          👁 Open
        </Link>

        <Link
          to={`/events/edit/${event.id}`}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
        >
          ✏ Edit
        </Link>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

export default EventCard;