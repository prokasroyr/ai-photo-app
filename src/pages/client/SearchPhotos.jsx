import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const AI_SERVER = "https://ai-photo-backend-8le8.onrender.com";

export default function SearchPhotos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId: urlEventId } = useParams();

  // ইভেন্ট আইডি ও সেলফি ফাইল রিসিভ করা
  const [eventId] = useState(
    urlEventId || location.state?.eventId || localStorage.getItem("lastEventId") || ""
  );
  const [selfieFile] = useState(location.state?.selfieFile || null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!eventId) {
      console.warn("⚠️ No Event ID found.");
    }
  }, [eventId]);

  const handleSearch = async () => {
    if (!eventId.trim()) {
      alert("ইভেন্ট কোড পাওয়া যায়নি! অনুগ্রহ করে আবার চেষ্টা করুন।");
      return;
    }

    setIsSearching(true);

    try {
      let selfieUrl = "";

      // ১. যদি সেলফি ফাইল থাকে, তবে ব্যাকএন্ডে আপলোড করে URL নেওয়া হবে
      if (selfieFile) {
        const formData = new FormData();
        formData.append("file", selfieFile);

        const uploadRes = await fetch(`${AI_SERVER}/upload-selfie`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.detail || "Selfie upload failed");
        }
        selfieUrl = uploadData.path || uploadData.url || uploadData.filePath || uploadData.selfieUrl || "";
      }

      // ২. AI সার্চ শুরু করা
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

      if (!searchRes.ok) {
        const errorMsg = typeof searchData.detail === "object"
          ? JSON.stringify(searchData.detail)
          : (searchData.detail || searchData.message || "Search start failed");
        throw new Error(errorMsg);
      }

      const jobId = searchData.jobId || searchData.job_id || searchData.taskId;

      if (!jobId) {
        throw new Error("Server returned response, but no Job ID was provided.");
      }

      // প্রোগ্রেস পেজে রিডাইরেক্ট
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

            {selfieFile && (
              <div className="py-2">
                <img
                  src={URL.createObjectURL(selfieFile)}
                  alt="Selected Selfie"
                  className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-purple-500 shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Selfie Ready</p>
              </div>
            )}

            <button
              onClick={handleSearch}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow transition duration-200"
            >
              🔍 Start AI Search
            </button>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <p className="text-lg font-semibold text-gray-800">
              Uploading & Connecting to AI Server...
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