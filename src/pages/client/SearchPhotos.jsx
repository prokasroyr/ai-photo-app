import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const AI_SERVER = "https://ai-photo-backend-8le8.onrender.com";

export default function SearchPhotos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId: urlEventId } = useParams();

  // ইভেন্ট কোড ও সেলফি স্টেট
  const [eventId, setEventId] = useState(
    urlEventId || location.state?.eventId || localStorage.getItem("lastEventId") || ""
  );
  const [selfie, setSelfie] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!eventId) {
      console.warn("⚠️ No Event ID found. Redirecting to home...");
    }
  }, [eventId]);

  // সেলফি আপলোড ও AI সার্চ শুরু
  const handleSearch = async () => {
    if (!eventId.trim()) {
      alert("ইভেন্ট কোড পাওয়া যায়নি! অনুগ্রহ করে আবার চেষ্টা করুন।");
      return;
    }

    if (!selfie) {
      alert("অনুগ্রহ করে আপনার একটি সেলফি সিলেক্ট করুন!");
      return;
    }

    setIsSearching(true);

    try {
      // ১. সেলফি আপলোড
      const formData = new FormData();
      formData.append("file", selfie);

      const uploadRes = await fetch(`${AI_SERVER}/upload-selfie`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.detail || "Selfie upload failed");

      const selfieUrl = uploadData.path || uploadData.url || uploadData.filePath || uploadData.selfieUrl;

      // ২. সার্চ স্টার্ট
      const searchRes = await fetch(`${AI_SERVER}/start-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId.trim(),
          event_id: eventId.trim(),
          selfieUrl: selfieUrl,
          selfie_url: selfieUrl,
        }),
      });

      const searchData = await searchRes.json();
      if (!searchRes.ok) throw new Error(searchData.detail || "Search start failed");

      const jobId = searchData.jobId || searchData.job_id || searchData.taskId;

      // ৩. প্রোগ্রেস পেজে রিডাইরেক্ট
      navigate(`/client/processing/${jobId}`);

    } catch (error) {
      console.error("❌ Search Failed:", error);
      alert("Search Failed: " + (error.message || "Unknown error"));
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-6 text-center">

        {/* ---------------- UPLOAD SELFIE & SEARCH ---------------- */}
        {!isSearching ? (
          <div className="space-y-5">
            {eventId && (
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">
                  Event Code: {eventId}
                </span>
                <button
                  onClick={() => navigate("/client")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Change Code
                </button>
              </div>
            )}

            <h2 className="text-xl font-bold text-gray-800">
              🤳 Take or Upload a Selfie
            </h2>
            <p className="text-xs text-gray-500">
              আপনার একটি স্পষ্ট ছবি দিন যাতে AI ইভেন্ট থেকে আপনাকে খুঁজে বের করতে পারে
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelfie(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border rounded-lg p-1"
            />

            {selfie && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(selfie)}
                  alt="Selfie Preview"
                  className="w-24 h-24 object-cover rounded-full mx-auto border-2 border-purple-500 shadow-sm"
                />
              </div>
            )}

            <button
              onClick={handleSearch}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow transition duration-200"
            >
              🔍 Find My Photos
            </button>
          </div>
        ) : (
          /* ---------------- SEARCHING LOADING STATE ---------------- */
          <div className="py-6 space-y-4">
            <p className="text-lg font-semibold text-gray-800">
              Connecting to AI Server...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-purple-600 h-3 rounded-full animate-pulse w-full" />
            </div>
            <p className="text-xs text-gray-500">Please wait a moment...</p>
          </div>
        )}

      </div>
    </div>
  );
}