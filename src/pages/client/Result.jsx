import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getFavorites, toggleFavorite } from "../../utils/favorite";
import { handleSingleDownload, handleMultipleDownloads } from "../../utils/download";

const AI_SERVER = "https://ai-photo-backend-8le8.onrender.com";

export default function Result() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [matchedPhotos, setMatchedPhotos] = useState(
    location.state?.matchedPhotos || []
  );
  const [eventId, setEventId] = useState(
    location.state?.eventId || "default_event"
  );
  
  // LocalStorage অথবা রেজাল্ট থেকে স্টুডিওর নাম তুলে নেওয়ার লজিক
  const [studioName, setStudioName] = useState(
    () => location.state?.studioName || localStorage.getItem("studioName") || ""
  );

  const [favorites, setFavorites] = useState(() => getFavorites(eventId));
  const [loading, setLoading] = useState(!location.state?.matchedPhotos);

  // পেজ রিফ্রেশ দিলে ব্যাকএন্ড থেকে ডেটা রিকভার করার লজিক
  useEffect(() => {
    if (!location.state?.matchedPhotos && jobId) {
      fetch(`${AI_SERVER}/search-status/${jobId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "completed") {
            setMatchedPhotos(data.matches || []);
            if (data.eventId) {
              setEventId(data.eventId);
              setFavorites(getFavorites(data.eventId));
            }
            if (data.studioName) {
              setStudioName(data.studioName);
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [jobId, location.state]);

  const handleFavToggle = (photo) => {
    const updatedFavs = toggleFavorite(eventId, photo);
    setFavorites([...updatedFavs]);
  };

  if (loading) {
    return <div className="text-center py-20 font-semibold text-gray-600">Loading Results...</div>;
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

          {/* একাধিক JPG ডাউনলোড বাটন */}
          <button
            onClick={() => {
              const urls = matchedPhotos.map((item) => item.imageUrl || item.url || item.cloudinaryUrl);
              const currentStudio = studioName || localStorage.getItem("studioName") || "Studio Name";
              handleMultipleDownloads(urls, currentStudio);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
          >
            📥 Download All (JPG)
          </button>
        </div>
      </div>

      {matchedPhotos.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No photos matched your face.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {matchedPhotos.map((photo, index) => {
            const photoUrl = photo.imageUrl || photo.cloudinaryUrl || photo.url;
            const isFav = favorites.some((fav) => (fav.imageUrl || fav.url) === photoUrl);

            return (
              <div key={index} className="relative bg-white rounded-lg overflow-hidden border shadow-sm group">
                <button
                  onClick={() => handleFavToggle(photo)}
                  className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:scale-110 transition cursor-pointer"
                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                >
                  {isFav ? '❤️' : '🤍'}
                </button>

                <img src={photoUrl} alt="Result" className="w-full h-48 object-cover" />

                <div className="p-2 flex justify-between items-center bg-gray-50 border-t">
                  <span className="text-xs text-gray-500 font-medium">
                    Match: {photo.score ? (photo.score * 100).toFixed(0) : 100}%
                  </span>

                  {/* একক JPG ডাউনলোড বাটন */}
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