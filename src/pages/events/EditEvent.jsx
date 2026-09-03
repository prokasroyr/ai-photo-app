import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

function EditEvent() {
  const { id } = useParams();

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    loadEvent();
  }, []);

  const loadEvent = async () => {
    const snap = await getDoc(doc(db, "events", id));

    if (snap.exists()) {
      const data = snap.data();

      setEventName(data.eventName);
      setEventDate(data.eventDate);
      setLocation(data.location);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-6">
        ✏ Edit Event
      </h1>

      <input
        className="w-full border p-3 rounded mb-4"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
      />

      <input
        type="date"
        className="w-full border p-3 rounded mb-4"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
      />

      <input
        className="w-full border p-3 rounded mb-6"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <button className="bg-blue-600 text-white px-5 py-3 rounded-lg">
        Save Changes
      </button>
    </div>
  );
}

export default EditEvent;