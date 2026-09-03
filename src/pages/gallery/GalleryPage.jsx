import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../services/firebase";

function GalleryPage() {
  const [photos, setPhotos] = useState([]);  
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  useEffect(() => {
    loadEvents();
    loadPhotos();
  }, []);

  const toggleSelect = (id) => {
    if (selectedPhotos.includes(id)) {
      setSelectedPhotos(
        selectedPhotos.filter((photoId) => photoId !== id)
      );
    } else {
      setSelectedPhotos([...selectedPhotos, id]);
    }
  };

  const deleteSelected = async () => {
    if (selectedPhotos.length === 0) {
      alert("No photo selected");
      return;
    }

    const ok = window.confirm(
      `Delete ${selectedPhotos.length} photos from Cloudinary?`
    );

    if (!ok) return;

    try {
      for (const id of selectedPhotos) {
        const response = await fetch(
          "https://ai-photo-backend-8le8.onrender.com/delete-photo",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              photoId: id,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Photo delete failed"
          );
        }

        console.log("🗑️ Deleted:", id);
      }

      setSelectedPhotos([]);
      await loadPhotos();

      alert("✅ Photos deleted from Cloudinary & Firestore");

    } catch (error) {
      console.error("❌ Delete Failed:", error);
      alert(
        "Delete Failed: " +
        (error.message || "Unknown error")
      );
    }
  };

  const loadEvents = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const eventQuery = query(
        collection(db, "events"),
        where("photographerId", "==", user.uid)
      );

      const snap = await getDocs(eventQuery);
      const list = [];

      snap.forEach((docItem) => {
        list.push({
          id: docItem.id,
          ...docItem.data(),
        });
      });

      setEvents(list);
    } catch (error) {
      console.error("❌ Load Events Error:", error);
    }
  };

  const loadPhotos = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.log("❌ No logged-in user");
        setPhotos([]);
        return;
      }

      console.log("👤 Current User:", user.uid);

      // ১. বর্তমান photographer-এর events খুঁজে বের করা
      const eventQuery = query(
        collection(db, "events"),
        where("photographerId", "==", user.uid)
      );

      const eventSnap = await getDocs(eventQuery);
      const myEventIds = [];

      eventSnap.forEach((eventDoc) => {
        myEventIds.push(eventDoc.id);
      });

      // কোনো event না থাকলে কোনো photo দেখাবে না
      if (myEventIds.length === 0) {
        setPhotos([]);
        return;
      }

      // ২. শুধু নিজের events-এর photos নেওয়া
      const allPhotos = [];

      for (const eventId of myEventIds) {
        const photoQuery = query(
          collection(db, "photos"),
          where("eventId", "==", eventId)
        );

        const photoSnap = await getDocs(photoQuery);

        photoSnap.forEach((photoDoc) => {
          allPhotos.push({
            id: photoDoc.id,
            ...photoDoc.data(),
          });
        });
      }

      console.log("📸 My Photos:", allPhotos.length);
      setPhotos(allPhotos);

    } catch (error) {
      console.error("❌ Load Photos Error:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        📷 Photo Gallery
      </h1>

      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold text-lg">
          Selected Photos: {selectedPhotos.length}
        </p>

        <button
          onClick={deleteSelected}
          disabled={selectedPhotos.length === 0}
          className="bg-red-600 text-white px-5 py-2 rounded-lg disabled:bg-gray-400"
        >
          🗑 Delete Selected ({selectedPhotos.length})
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Search Photo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg p-3 w-full mb-6"
      />

      <select
        value={selectedEvent}
        onChange={(e) => setSelectedEvent(e.target.value)}
        className="border rounded-lg p-3 mb-6 w-full md:w-auto"
      >
        <option value="">All Events</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.eventName}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {photos
          .filter((photo) => {
            if (selectedEvent && photo.eventId !== selectedEvent)
              return false;

            if (
              search &&
              !photo.imageUrl.toLowerCase().includes(search.toLowerCase())
            )
              return false;

            return true;
          })
          .map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-xl shadow overflow-hidden relative"
            >
              <input
                type="checkbox"
                checked={selectedPhotos.includes(photo.id)}
                onChange={() => toggleSelect(photo.id)}
                className="absolute top-3 left-3 w-5 h-5 cursor-pointer z-10"
              />
              <img
                src={photo.imageUrl}
                alt=""
                className="w-full h-52 object-cover"
              />
            </div>
          ))}
      </div>
    </div>
  );
}

export default GalleryPage;