import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getFavorites, toggleFavorite } from "../../utils/favorite";
import { handleSingleDownload, handleMultipleDownloads } from "../../utils/download";

const AI_SERVER = "https://ai-photo-backend-8le8.onrender.com";

export default function Result() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ১. ইনিশিয়াল স্টেট (Router State, SessionStorage অথবা ফ্যালব্যাক)
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
  const [loading, setLoading] = useState(matchedPhotos.length === 0 && !!jobId);

  // ২. যদি কোনো কারণে স্টেট ফাঁকা থাকে, ব্যাকএন্ড থেকে ডেটা রিকভার করা
  useEffect(() => {
    if (matchedPhotos.length === 0 && jobId) {
      setLoading(true);
      fetch(`${AI_SERVER}/search-status/${jobId}`)
        .then((res) => res.json())
        .then((data) => {
          // ব্যাকএন্ডের সম্ভাব্য সব ধরনের কি (Key) চেক করা হচ্ছে
          const photos =
            data.matches ||
            data.matchedPhotos ||
            data.matched_photos ||
            data.results ||
            [];

          if (photos.length > 0) {
            setMatchedPhotos(photos);
            sessionStorage.setItem(`photos_${jobId}`, JSON.stringify(photos));
          }

          if (data.eventId) {
            setEventId(data.eventId);
            setFavorites(getFavorites(data.eventId));
          }
          if (data.studioName) {
            setStudioName(data.studioName);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [jobId, matchedPhotos.length]);

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

          {/* একাধিক JPG ডাউনলোড বাটন */}
          <button
            onClick={() => {
              const urls = matchedPhotos.map(
                (item) => item.imageUrl || item.url || item.cloudinaryUrl || item.path
              );
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