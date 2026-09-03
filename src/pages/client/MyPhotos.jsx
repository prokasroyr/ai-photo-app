import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

function MyPhotos() {
  const location = useLocation();

  // location.state অথবা localStorage থেকে ছবি লোড করা (পেজ রিফ্রেশ করলেও ছবি থাকবে)
  const [photos] = useState(() => {
    if (location.state?.photos && location.state.photos.length > 0) {
      return location.state.photos;
    }
    const saved = localStorage.getItem("matchedPhotos");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedIndex, setSelectedIndex] = useState(null);
  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  const showPrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    }
  };

  const showNext = () => {
    if (selectedIndex < photos.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    }
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  // কিবোর্ডের Arrow Key দিয়ে ছবি দেখা ও Esc দিয়ে ক্লোজ করা
  useEffect(() => {
    const handleKey = (e) => {
      if (selectedIndex === null) return;

      if (e.key === "ArrowRight") {
        showNext();
      } else if (e.key === "ArrowLeft") {
        showPrevious();
      } else if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [selectedIndex, photos.length]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              🎉 Your AI Photos
            </h1>
            <p className="text-gray-500 mt-1">
              {photos.length} photo(s) found
            </p>
          </div>

          <Link
            to="/search"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            🔍 Search Again
          </Link>
        </div>

        {/* Empty State */}
        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center max-w-md mx-auto mt-10">
            <div className="text-7xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Photos Found
            </h2>
            <p className="text-gray-500 mb-6">
              Please upload another selfie or check your Event Code.
            </p>
            <Link
              to="/search"
              className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              📸 Upload New Selfie
            </Link>
          </div>
        ) : (
          /* Photo Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo, index) => {
              const photoUrl = photo.imageUrl || photo.cloudinaryUrl || photo.url;
              const matchScore = photo.score
                ? (photo.score * 100).toFixed(1)
                : null;

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow hover:shadow-2xl transition duration-300 overflow-hidden flex flex-col"
                >
                  <div
                    onClick={() => setSelectedIndex(index)}
                    className="h-72 overflow-hidden bg-gray-200 cursor-pointer relative group"
                  >
                    <img
                      src={photoUrl}
                      alt={`AI Match ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-semibold">
                      🔍 Click to Preview
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div className="flex justify-between items-center mb-4">
                      {matchScore ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          {matchScore}% Match
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                          Match Found
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedIndex(index)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium text-sm transition"
                      >
                        Preview
                      </button>

                      <a
                        href={photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium text-sm text-center transition"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fullscreen Preview Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 bg-red-600 text-white w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center z-10 hover:bg-red-700 transition"
            >
              ✕
            </button>

            {/* Previous Button */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center z-10 shadow-lg transition"
              >
                ⬅️
              </button>
            )}

            {/* Next Button */}
            {selectedIndex < photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center z-10 shadow-lg transition"
              >
                ➡️
              </button>
            )}

            {/* Modal Image Box */}
            <div
              className="relative max-w-4xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={
                  selectedPhoto.imageUrl ||
                  selectedPhoto.cloudinaryUrl ||
                  selectedPhoto.url
                }
                alt="Selected Preview"
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
              />

              <div className="text-center text-white mt-4 flex flex-col items-center">
                {selectedPhoto.score && (
                  <h2 className="text-2xl font-bold text-green-400">
                    {(selectedPhoto.score * 100).toFixed(1)}% Match
                  </h2>
                )}

                <p className="mt-1 text-gray-300 text-sm">
                  Photo {selectedIndex + 1} of {photos.length}
                </p>

                <a
                  href={
                    selectedPhoto.imageUrl ||
                    selectedPhoto.cloudinaryUrl ||
                    selectedPhoto.url
                  }
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl transition inline-flex items-center gap-2"
                >
                  📥 Download Image
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPhotos;