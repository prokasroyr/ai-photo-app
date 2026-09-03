import React, { useState, useEffect } from 'react';
import { getFavorites, toggleFavorite } from '../../utils/favorite';
import { handleSingleDownload, handleZipDownload } from '../../utils/download';

export default function FavoriteGallery({ eventId = "default_event", studioName = "Your Studio Name" }) {
  const [favorites, setFavorites] = useState([]);

  // কম্পোনেন্ট লোড হলে LocalStorage থেকে ফেভারিট ছবিগুলো নিয়ে আসবে
  useEffect(() => {
    const savedFavs = getFavorites(eventId);
    setFavorites(savedFavs);
  }, [eventId]);

  // ফেভারিট লিস্ট থেকে কোনো ছবি রিমুভ করার হ্যান্ডলার
  const handleRemoveFavorite = (photo) => {
    const updatedFavs = toggleFavorite(eventId, photo);
    setFavorites([...updatedFavs]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ১. হেডার ও এক ক্লিকে ফেভারিট ZIP ডাউনলোড সেকশন */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-pink-50 p-6 rounded-2xl border border-pink-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ❤️ My Favorite Photos ({favorites.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            আপনার পছন্দ করা সব ছবি এখানে সংরক্ষিত আছে।
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={() => {
              const urls = favorites.map((item) => item.imageUrl);
              handleZipDownload(urls, "My_Favorites.zip", studioName);
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
          >
            📦 Download All Favorites (ZIP)
          </button>
        )}
      </div>

      {/* ২. ফেভারিট ছবি না থাকলে যা দেখাবে */}
      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-4xl mb-3">🤍</p>
          <h3 className="text-lg font-semibold text-gray-700">এখনো কোনো ছবি ফেভারিট করেননি!</h3>
          <p className="text-sm text-gray-500 mt-1">
            সার্চ রেজাল্ট থেকে ছবির ওপরের Heart (❤️) আইকনে ক্লিক করে ফেভারিট লিস্টে যোগ করুন।
          </p>
        </div>
      ) : (
        /* ৩. ফেভারিট ছবির গ্যালারি গ্রিড */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {favorites.map((photo, index) => (
            <div key={index} className="relative bg-white rounded-xl overflow-hidden border shadow-sm group">
              
              {/* রিমুভ বাটন */}
              <button
                onClick={() => handleRemoveFavorite(photo)}
                className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur rounded-full shadow hover:bg-red-50 text-red-500 transition"
                title="Remove from favorites"
              >
                ❌
              </button>

              {/* ছবির ইমেজ */}
              <img src={photo.imageUrl} alt="Favorite" className="w-full h-48 object-cover" />

              {/* সিঙ্গেল ডাউনলোড বাটন */}
              <div className="p-3 flex justify-between items-center bg-gray-50 border-t">
                <span className="text-xs text-gray-500">Photo #{index + 1}</span>

                <button
                  onClick={() =>
                    handleSingleDownload(photo.imageUrl, `favorite_${index + 1}.jpg`, studioName)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
                >
                  📥 Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}