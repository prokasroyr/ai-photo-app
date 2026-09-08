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
  import React, { useState, useEffect } from "react";
  import { useLocation, useNavigate, useParams } from "react-router-dom";
  import { getFavorites, toggleFavorite } from "../../utils/favorite";
  import {
  handleSingleDownload,
  handleMultipleDownloads
} from "../../utils/download";

const AI_SERVER = "https://ai-photo-backend-8le8.onrender.com";

export default function Result() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [matchedPhotos, setMatchedPhotos] = useState(() => {
    if (location.state?.matchedPhotos?.length > 0) {
      sessionStorage.setItem(
        `photos_${jobId}`,
        JSON.stringify(location.state.matchedPhotos)
      );

      return location.state.matchedPhotos;
    }

    const saved = sessionStorage.getItem(`photos_${jobId}`);

    return saved ? JSON.parse(saved) : [];
  });

  const [eventId, setEventId] = useState(
    location.state?.eventId ||
      localStorage.getItem("lastEventId") ||
      "default_event"
  );

  const [studioName, setStudioName] = useState(
    () =>
      location.state?.studioName ||
      localStorage.getItem("studioName") ||
      ""
  );

  const [favorites, setFavorites] = useState(() =>
    getFavorites(eventId)
  );

  const [loading, setLoading] = useState(
    matchedPhotos.length === 0 && !!jobId
  );

  const [progress, setProgress] = useState(0);

  const [searchStatus, setSearchStatus] = useState(
    matchedPhotos.length > 0 ? "completed" : "processing"
  );

  // =====================================================
  // AI SEARCH RESULT POLLING
  // =====================================================

  useEffect(() => {
    if (!jobId) return;

    // যদি আগে থেকেই result থাকে তাহলে আর polling দরকার নেই
    if (matchedPhotos.length > 0) {
      setLoading(false);
      setSearchStatus("completed");
      return;
    }

    let cancelled = false;
    let timer = null;

    const checkSearchStatus = async () => {
      try {
        console.log("🔎 Checking AI search:", jobId);

        const response = await fetch(
          `${AI_SERVER}/search-status/${jobId}`
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const data = await response.json();

        console.log("📊 AI Search Status:", data);

        if (cancelled) return;

        // Event ID
        if (data.eventId) {
          setEventId(data.eventId);
          setFavorites(getFavorites(data.eventId));
        }

        // Studio name
        if (data.studioName) {
          setStudioName(data.studioName);
        }

        // Progress
        setProgress(data.progress || 0);

        // Possible result keys
        const photos =
          data.matches ||
          data.matchedPhotos ||
          data.matched_photos ||
          data.results ||
          [];

        // ============================================
        // AI COMPLETED
        // ============================================

        if (data.status === "completed") {
          console.log(
            `✅ AI Search Completed. Matches: ${photos.length}`
          );

          setSearchStatus("completed");
          setLoading(false);

          if (photos.length > 0) {
            setMatchedPhotos(photos);

            sessionStorage.setItem(
              `photos_${jobId}`,
              JSON.stringify(photos)
            );
          }

          return;
        }

        // ============================================
        // AI FAILED
        // ============================================

        if (data.status === "failed") {
          console.error(
            "❌ AI Search Failed:",
            data.error
          );

          setSearchStatus("failed");
          setLoading(false);

          return;
        }

        // ============================================
        // AI STILL PROCESSING
        // ============================================

        setSearchStatus("processing");
        setLoading(true);

        // আবার 1.5 second পরে check
        timer = setTimeout(
          checkSearchStatus,
          1500
        );

      } catch (error) {
        console.error(
          "❌ Search status error:",
          error
        );

        if (!cancelled) {
          // Error হলেও retry করবে
          timer = setTimeout(
            checkSearchStatus,
            2000
          );
        }
      }
    };

    checkSearchStatus();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [jobId]);

  // =====================================================
  // FAVORITE
  // =====================================================

  const handleFavToggle = (photo) => {
    const updatedFavs = toggleFavorite(
      eventId,
      photo
    );

    setFavorites([...updatedFavs]);
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">

          <div className="text-5xl mb-4">
            🔎
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            AI Searching...
          </h2>

          <p className="text-gray-500 mb-5">
            We are finding photos that match your face.
          </p>

          {/* Progress */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-600 h-4 transition-all duration-500"
              style={{
                width: `${progress}%`
              }}
            />
          </div>

          <p className="mt-3 font-semibold text-gray-700">
            {progress}% Complete
          </p>

          <p className="text-sm text-gray-400 mt-2">
            Please wait...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // FAILED
  // =====================================================

  if (searchStatus === "failed") {
    return (
      <div className="text-center py-20">

        <div className="text-5xl mb-4">
          ❌
        </div>

        <h2 className="text-2xl font-bold text-red-600">
          AI Search Failed
        </h2>

        <p className="text-gray-500 mt-2">
          Something went wrong while searching.
        </p>

        <button
          onClick={() => navigate("/search")}
          className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Try Searching Again
        </button>

      </div>
    );
  }

  // =====================================================
  // MAIN RESULT PAGE
  // =====================================================

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Your Found Photos ({matchedPhotos.length})
        </h2>

        <div className="flex items-center gap-3">

          {/* FAVORITES */}

          <button
            onClick={() =>
              navigate(`/favorites/${eventId}`)
            }
            className="bg-pink-100 hover:bg-pink-200 text-pink-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 border border-pink-300 transition"
          >
            ❤️ Favorites ({favorites.length})
          </button>

          {/* DOWNLOAD ALL */}

          <button
            disabled={matchedPhotos.length === 0}
            onClick={() => {

              const urls = matchedPhotos
                .map(
                  (item) =>
                    item.imageUrl ||
                    item.url ||
                    item.cloudinaryUrl ||
                    item.path
                )
                .filter(Boolean);

              const currentStudio =
                studioName ||
                localStorage.getItem("studioName") ||
                "Studio Name";

              handleMultipleDownloads(
                urls,
                currentStudio
              );
            }}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
          >
            📥 Download All (JPG)
          </button>

        </div>
      </div>

      {/* NO MATCH */}

      {matchedPhotos.length === 0 ? (

        <div className="text-center py-16 bg-white rounded-xl border border-dashed my-4">

          <div className="text-5xl mb-4">
            😔
          </div>

          <p className="text-gray-500 font-medium">
            No photos matched your face.
          </p>

          <button
            onClick={() =>
              navigate("/search")
            }
            className="mt-4 text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
          >
            Try Searching Again
          </button>

        </div>

      ) : (

        /* PHOTO GRID */

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {matchedPhotos.map(
            (photo, index) => {

              const photoUrl =
                photo.imageUrl ||
                photo.cloudinaryUrl ||
                photo.url ||
                photo.path;

              const isFav =
                favorites.some(
                  (fav) =>
                    (
                      fav.imageUrl ||
                      fav.url ||
                      fav.path
                    ) === photoUrl
                );

              return (

                <div
                  key={
                    photo.photoId ||
                    photo.matchDocId ||
                    index
                  }
                  className="relative bg-white rounded-lg overflow-hidden border shadow-sm group"
                >

                  {/* FAVORITE */}

                  <button
                    onClick={() =>
                      handleFavToggle(photo)
                    }
                    className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:scale-110 transition cursor-pointer"
                    title={
                      isFav
                        ? "Remove from Favorites"
                        : "Add to Favorites"
                    }
                  >
                    {isFav
                      ? "❤️"
                      : "🤍"}
                  </button>

                  {/* IMAGE */}

                  <img
                    src={photoUrl}
                    alt="Matched result"
                    className="w-full h-48 object-cover"
                  />

                  {/* FOOTER */}

                  <div className="p-2 flex justify-between items-center bg-gray-50 border-t">

                    <span className="text-xs text-gray-500 font-medium">
                      Match:{" "}
                      {photo.score
                        ? (
                            photo.score *
                            100
                          ).toFixed(0)
                        : 100}
                      %
                    </span>

                    {/* DOWNLOAD */}

                    <button
                      onClick={() => {

                        const currentStudio =
                          photo.studioName ||
                          studioName ||
                          localStorage.getItem(
                            "studioName"
                          ) ||
                          "Studio Name";

                        handleSingleDownload(
                          photoUrl,
                          `photo_${index + 1}.jpg`,
                          currentStudio
                        );
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition flex items-center gap-1"
                    >
                      📥 Download
                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}

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