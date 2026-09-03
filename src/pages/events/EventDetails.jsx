import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PhotoUpload from "../../components/upload/PhotoUpload";
import { db } from "../../services/firebase";

import {
  doc,
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (!id) return;

    // 1. রিয়েল-টাইমে ইভেন্ট এবং প্রোগ্রেস ডাটা ট্র্যাক করা
    const eventRef = doc(db, "events", id);
    const unsubscribeEvent = onSnapshot(eventRef, (docSnap) => {
      if (docSnap.exists()) {
        setEvent(docSnap.data());
      } else {
        console.log("Event not found");
      }
    });

    // 2. রিয়েল-টাইমে ফটোর তালিকা ও AI স্টেটাস ট্র্যাক করা
    const photosQuery = query(
      collection(db, "photos"),
      where("eventId", "==", id)
    );

    const unsubscribePhotos = onSnapshot(photosQuery, (snapshot) => {
      const photoList = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPhotos(photoList);
    });

    return () => {
      unsubscribeEvent();
      unsubscribePhotos();
    };
  }, [id]);

  // ফটো কাউন্ট হিসাব করার লজিক (পাইথন ব্যাকএন্ড hasFace ফিল্ড যোগ করে)
  const totalPhotos = photos.length;
  const processedPhotos = photos.filter((p) => p.hasFace !== undefined).length;
  const pendingPhotos = totalPhotos - processedPhotos;

  // পাইথন ব্যাকএন্ড থেকে আসা রিয়েল-টাইম প্রোগ্রেস
  const processingStatus = event?.processingStatus || {};
  const aiStatus = processingStatus.status || "";
  const aiProgress = processingStatus.percentage || 0;

  const startAIProcessing = async () => {
    try {
      setProcessing(true);

      const response = await fetch("https://ai-photo-backend-8le8.onrender.com/process-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: id,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`🤖 AI Processing Started!\nCheck real-time progress below.`);
      } else {
        alert("Failed to start AI Processing");
      }
    } catch (error) {
      console.error(error);
      alert("AI Processing Failed! Server connection error.");
    } finally {
      setProcessing(false);
    }
  };

  if (!event) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold">Loading Event...</h2>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">📅 Event Details</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-5">{event.eventName}</h2>

        <p>
          <strong>Event Code:</strong> {event.eventCode}
        </p>
        <p>
          <strong>Date:</strong> {event.eventDate}
        </p>
        <p>
          <strong>Location:</strong> {event.location}
        </p>
        <p>
          <strong>Type:</strong> {event.eventType}
        </p>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <div className="bg-blue-100 p-5 rounded-xl">
            <h3 className="text-lg font-bold">📊 Total Photos</h3>
            <p className="text-3xl font-bold">{totalPhotos}</p>
          </div>

          <div className="bg-green-100 p-5 rounded-xl">
            <h3 className="text-lg font-bold">🤖 AI Processed</h3>
            <p className="text-3xl font-bold">{processedPhotos}</p>
          </div>

          <div className="bg-yellow-100 p-5 rounded-xl">
            <h3 className="text-lg font-bold">⏳ Pending</h3>
            <p className="text-3xl font-bold">{pendingPhotos}</p>
          </div>
        </div>

        {/* AI Processing Button */}
        <div className="mt-6">
          <button
            onClick={startAIProcessing}
            disabled={processing || aiStatus === "processing"}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {processing || aiStatus === "processing"
              ? "🤖 Processing..."
              : "🤖 Start AI Processing"}
          </button>
        </div>

        <div className="flex gap-4 mt-8">
          <Link
            to="/gallery"
            className="bg-green-600 text-white px-5 py-3 rounded-lg"
          >
            📷 Gallery
          </Link>

          <Link
            to={`/events/edit/${id}`}
            className="bg-yellow-500 text-white px-5 py-3 rounded-lg"
          >
            ✏ Edit
          </Link>
        </div>

        <div className="mt-8">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-purple-600 text-white px-5 py-3 rounded-lg"
          >
            📤 Upload Photos
          </button>

          {showUpload && (
            <div className="mt-5">
              <PhotoUpload eventId={id} />
            </div>
          )}
        </div>

        {/* Real-time Progress Bar */}
        {aiStatus && (
          <div className="mt-6">
            <h3 className="font-bold text-lg">
              🤖 AI Processing Status:{" "}
              <span className="capitalize text-indigo-600">{aiStatus}</span>
            </h3>

            <div className="w-full bg-gray-200 rounded-full h-5 mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-5 rounded-full transition-all duration-300"
                style={{
                  width: `${aiProgress}%`,
                }}
              ></div>
            </div>

            <p className="mt-2 text-sm font-semibold text-gray-600">
              {aiProgress}% Complete
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;