import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

function Result() {
  const { jobId } = useParams();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [watermarkText, setWatermarkText] = useState("Photography");

  // ==========================================
  // RENDER AI BACKEND (নতুন Render URL বসান)
  // ==========================================
  const AI_SERVER = "YOUR_NEW_RENDER_URL"; // যেমন: https://ai-photo-backend-8le8.onrender.com

  // ==========================================
  // Download Photo With Watermark
  // ==========================================
  const downloadPhoto = async (imageUrl, index) => {
    try {
      if (!imageUrl) {
        alert("❌ Photo URL পাওয়া যায়নি");
        return;
      }

      const watermark = watermarkText.trim() || "Photography";

      console.log("📥 Downloading photo...");
      console.log("🔗 Image URL:", imageUrl);
      console.log("💧 Watermark:", watermark);

      // ======================================
      // SEND REQUEST TO RENDER BACKEND
      // ======================================
      const response = await fetch(`${AI_SERVER}/download-single`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          image_url: imageUrl,
          filename: `photo-${index + 1}.jpg`,
          watermarkText: watermark,
          watermark_text: watermark,
        }),
      });

      // ======================================
      // HANDLE BACKEND ERROR
      // ======================================
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Backend Error:", errorText);
        throw new Error(errorText || "Download failed");
      }

      // ======================================
      // GET IMAGE BLOB & DOWNLOAD
      // ======================================
      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error("Empty photo received from server");
      }

      console.log("📦 Photo received:", blob.size, "bytes");

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `photo-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // CLEANUP
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);

      console.log("✅ Watermark photo downloaded successfully");
    } catch (error) {
      console.error("❌ Watermark Download Error:", error);
      alert(
        "Watermark সহ Photo download failed\n\n" +
          (error.message || "Unknown error")
      );
    }
  };

  // ==========================================
  // Add to Favorites
  // ==========================================
  const addFavorite = async (photo) => {
    try {
      await addDoc(collection(db, "favorites"), {
        jobId,
        photoId: photo.id || photo.photoId,
        imageUrl: photo.imageUrl,
        createdAt: serverTimestamp(),
      });

      alert("❤️ Added to Favorites");
    } catch (error) {
      console.error("❌ Error adding favorite:", error);
      alert("Failed to add favorite");
    }
  };

  // ==========================================
  // Load Watermark
  // ==========================================
  const loadWatermark = async () => {
    try {
      const jobRef = doc(db, "aiJobs", jobId);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) {
        setWatermarkText("Photography");
        return;
      }

      const eventId = jobSnap.data().eventId;
      if (!eventId) {
        setWatermarkText("Photography");
        return;
      }

      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        setWatermarkText("Photography");
        return;
      }

      const eventData = eventSnap.data();
      const photographerId =
        eventData.userId || eventData.photographerId || eventData.creatorId;

      if (!photographerId) {
        setWatermarkText("Photography");
        return;
      }

      const settingsRef = doc(db, "settings", photographerId);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        const studio =
          data.studioName || data.photographerName || "Photography";
        setWatermarkText(studio);
      } else {
        setWatermarkText("Photography");
      }
    } catch (error) {
      console.error("❌ Failed to load watermark:", error);
      setWatermarkText("Photography");
    }
  };

  // ==========================================
  // Fetch Matched Photos
  // ==========================================
  useEffect(() => {
    if (!jobId) return;

    loadWatermark();

    const q = query(
      collection(db, "photoMatches"),
      where("jobId", "==", jobId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const photoList = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setPhotos(photoList);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error fetching photos:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [jobId]);

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-2">🎉 Your Photos</h1>
      <p className="text-center text-gray-500 mb-8">
        Total Photos Found: {photos.length}
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-xl font-semibold text-gray-500">
            Loading your photos...
          </p>
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold">😔 No Photos Found</h2>
          <p className="mt-3 text-gray-500">
            Try another selfie or contact the photographer.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden"
            >
              <img
                src={photo.imageUrl}
                alt="matched"
                onClick={() => setSelectedIndex(index)}
                className="w-full h-72 object-cover cursor-pointer"
              />

              <div className="p-4 flex gap-2">
                <button
                  onClick={() => downloadPhoto(photo.imageUrl, index)}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold"
                >
                  ⬇ Download
                </button>

                <button
                  onClick={() => addFavorite(photo)}
                  className="w-1/2 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-sm font-semibold"
                >
                  ❤️ Favorite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX / MODAL */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-5 right-8 text-white text-4xl hover:text-gray-300"
          >
            ✕
          </button>

          <button
            onClick={() =>
              setSelectedIndex(
                (selectedIndex - 1 + photos.length) % photos.length
              )
            }
            className="absolute left-5 text-white text-5xl hover:text-gray-300"
          >
            ❮
          </button>

          <div className="flex flex-col items-center max-w-full">
            <img
              src={photos[selectedIndex].imageUrl}
              alt="Preview"
              className="max-h-[75vh] max-w-[90vw] rounded-xl object-contain mb-4"
            />

            <div className="flex gap-4">
              <button
                onClick={() => addFavorite(photos[selectedIndex])}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold shadow"
              >
                ❤️ Add to Favorites
              </button>

              <button
                onClick={() =>
                  downloadPhoto(photos[selectedIndex].imageUrl, selectedIndex)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow"
              >
                ⬇ Download Photo
              </button>
            </div>
          </div>

          <button
            onClick={() =>
              setSelectedIndex((selectedIndex + 1) % photos.length)
            }
            className="absolute right-5 text-white text-5xl hover:text-gray-300"
          >
            ❯
          </button>
        </div>
      )}
    </div>
  );
}

export default Result;