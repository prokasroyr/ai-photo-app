import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getFavorites, toggleFavorite } from "../../utils/favorite";
import { handleSingleDownload, handleMultipleDownloads } from "../../utils/download";

const AI_SERVER = "https://ai-photo-backend-8le8.onrender.com";

export default function Result() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ১. ইনিশিয়াল স্টেট
  const [matchedPhotos, setMatchedPhotos] = useState(() => {
    if (location.state?.matchedPhotos?.length > 0) {
      sessionStorage.setItem(`photos_${jobId}`, JSON.stringify(location.state.matchedPhotos));
      return location.state.matchedPhotos;
    }
    const saved = sessionStorage.getItem(`photos_${jobId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [eventId, setEventId] = useState(
    location.state?.eventId || localStorage.getItem("lastEventId") || "default_event"
  );
  
  const [studioName, setStudioName] = useState(
    () => location.state?.studioName || localStorage.getItem("studioName") || ""
  );

  const [favorites, setFavorites] = useState(() => getFavorites(eventId));
  
  // ব্যাকএন্ডে একবার রিকুয়েস্ট গেছে কিনা তা ট্র্যাক করার জন্য
  const [loading, setLoading] = useState(matchedPhotos.length === 0 && !!jobId);

  // ২. ব্যাকএন্ড থেকে ডেটা রিকভার করা (Fix: Dependency Array)
  useEffect(() => {
    // যদি অলরেডি ডেটা থাকে অথবা jobId না থাকে তবে ফেচ করার প্রয়োজন নেই
    if (matchedPhotos.length > 0 || !jobId) return;

    let isMounted = true;
    setLoading(true);

    fetch(`${AI_SERVER}/search-status/${jobId}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Search status failed (${res.status}): ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;

        console.log("🔎 Search status response:", data);
        
        const photos =
          data.matches ||
          data.matchedPhotos ||
          data.matched_photos ||
          data.results ||
          [];

        setMatchedPhotos(photos);
        sessionStorage.setItem(`photos_${jobId}`, JSON.stringify(photos));

        if (data.eventId) {
          setEventId(data.eventId);
          setFavorites(getFavorites(data.eventId));
        }
        if (data.studioName) {
          setStudioName(data.studioName);
        }
      })
      .catch((err) => console.error("Fetch Error:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false; // Memory Leak বন্ধ করার জন্য
    };
  }, [jobId]); // matchedPhotos.length বাদ দেওয়া হয়েছে

  const handleFavToggle = (photo) => {
    const updatedFavs = toggleFavorite(eventId, photo);
    setFavorites([...updatedFavs]);
  };

  if (loading) {
    return (
      <div className="text-center py-20 font-semibold text-gray-600">
        Fetching your results...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Your Found Photos ({matchedPhotos.length})
        </h2>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/favorites/${eventId}`)}
            className="bg-pink-100 hover:bg-pink-200 text-pink-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 border border-pink-300 transition"
          >
            ❤️ Favorites ({favorites.length})
          </button>

          <button
            onClick={() => {
              const urls = matchedPhotos
                .map((item) => item.imageUrl || item.url || item.cloudinaryUrl || item.path)
                .filter(Boolean); // ফাঁকা URL রিমুভ করার জন্য
              
              const currentStudio = studioName || localStorage.getItem("studioName") || "Studio Name";
              handleMultipleDownloads(urls, currentStudio);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
            disabled={matchedPhotos.length === 0}
          >
            📥 Download All (JPG)
          </button>
        </div>
      </div>

      {matchedPhotos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed my-4">
          <p className="text-gray-500 font-medium">No photos matched your face.</p>
          <button
            onClick={() => navigate("/search")}
            className="mt-4 text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
          >
            Try Searching Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {matchedPhotos.map((photo, index) => {
            const photoUrl = photo.imageUrl || photo.cloudinaryUrl || photo.url || photo.path;
            const isFav = favorites.some((fav) => (fav.imageUrl || fav.url || fav.path) === photoUrl);

            return (
              <div key={photo._id || index} className="relative bg-white rounded-lg overflow-hidden border shadow-sm group">
                <button
                  onClick={() => handleFavToggle(photo)}
                  className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:scale-110 transition cursor-pointer"
                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                >
                  {isFav ? '❤️' : '🤍'}
                </button>

                <img src={photoUrl} alt={`Result ${index + 1}`} className="w-full h-48 object-cover" />

                <div className="p-2 flex justify-between items-center bg-gray-50 border-t">
                  <span className="text-xs text-gray-500 font-medium">
                    Match: {photo.score ? (photo.score * 100).toFixed(0) : 100}%
                  </span>

                  <button
                    onClick={() => {
                      const currentStudio = photo.studioName || studioName || localStorage.getItem("studioName") || "Studio Name";
                      handleSingleDownload(photoUrl, `photo_${index + 1}.jpg`, currentStudio);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition flex items-center gap-1"
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}