import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db, auth  } from "../../services/firebase";


function CreateEvent() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");

  const auth = getAuth();

  const saveEvent = async () => {
    if (!eventName || !eventDate) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please login first");
        return;
      }

      const eventCode =
        "EV-" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

      await addDoc(collection(db, "events"), {
        eventName,
        eventDate,
        location,
        eventType,
        eventCode,
        photographerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      alert("✅ Event Created Successfully");

      setEventName("");
      setEventDate("");
      setLocation("");
      setEventType("");

    } catch (error) {
      console.error("Create Event Error:", error);
      alert("Failed to create event");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
      <h1 className="text-3xl font-bold mb-8">
        ➕ Create New Event
      </h1>

      <input
        type="text"
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        className="w-full border p-3 rounded-lg mb-4"
      />

      <input
        type="date"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        className="w-full border p-3 rounded-lg mb-4"
      />

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full border p-3 rounded-lg mb-4"
      />

      <select
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
        className="w-full border p-3 rounded-lg mb-6"
      >
        <option value="">Select Event Type</option>
        <option>Wedding</option>
        <option>Birthday</option>
        <option>Corporate</option>
        <option>Reception</option>
        <option>Other</option>
      </select>

      <button
        onClick={saveEvent}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Save Event
      </button>
    </div>
  );
}

export default CreateEvent;