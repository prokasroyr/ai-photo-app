import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function SearchPhotos() {
  const location = useLocation();
  const navigate = useNavigate();

  const [eventId, setEventId] = useState(
    location.state?.eventId || ""
  );

  const [selfie, setSelfie] = useState(
    location.state?.selfieFile || null
  );

  const [isSearching, setIsSearching] = useState(false);
  const autoSearchStarted = useRef(false); // ✅ const যুক্ত করা হয়েছে

  // ==========================================
  // AI BACKEND SERVER URL
  // ==========================================
  const AI_SERVER = "https://ai-photo-backend-8le8.onrender.com"; // ✅ আপনার লাইভ রেন্ডার URL

  // ==========================================
  // Auto search when coming from UploadSelfie
  // ==========================================
  useEffect(() => {
    if (
      !location.state?.eventId ||
      !location.state?.selfieFile
    ) {
      return;
    }

    if (autoSearchStarted.current) {
      return;
    }

    autoSearchStarted.current = true;

    handleSearch(
      location.state.eventId,
      location.state.selfieFile
    );
  }, [location.state]);

  // ==========================================
  // START AI SEARCH
  // ==========================================
  const handleSearch = async (
    overrideEventId,
    overrideSelfie
  ) => {
    if (isSearching) {
      return;
    }

    const currentEventId = overrideEventId || eventId;
    const currentSelfie = overrideSelfie || selfie;

    // Check Event ID
    if (!currentEventId) {
      alert("Enter Event Code");
      return;
    }

    // Check Selfie
    if (!currentSelfie) {
      alert("Select a selfie");
      return;
    }

    setIsSearching(true);

    try {
      // ======================================
      // 1. UPLOAD SELFIE
      // ======================================
      console.log("📸 Uploading selfie...");

      const formData = new FormData();
      formData.append("file", currentSelfie);

      const uploadRes = await fetch(
        `${AI_SERVER}/upload-selfie`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();
      console.log("📸 Selfie Upload Response:", uploadData);

      if (!uploadRes.ok) {
        throw new Error(
          uploadData.detail || "Selfie upload failed"
        );
      }

      // ======================================
      // GET SELFIE URL (Snake_case & CamelCase Support)
      // ======================================
      const selfieUrl =
        uploadData.path ||
        uploadData.url ||
        uploadData.filePath ||
        uploadData.selfieUrl ||
        uploadData.selfie_url;

      if (!selfieUrl) {
        throw new Error("Selfie uploaded but no URL returned");
      }

      console.log("📸 Selfie URL:", selfieUrl);

      // ======================================
      // 2. START AI SEARCH
      // ======================================
      console.log("🤖 Starting AI search...");

      const searchRes = await fetch(
        `${AI_SERVER}/start-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId: currentEventId,
            event_id: currentEventId,
            selfieUrl: selfieUrl,
            selfie_url: selfieUrl,
          }),
        }
      );

      const searchData = await searchRes.json();
      console.log("🤖 Start Search Response:", searchData);

      if (!searchRes.ok) {
        throw new Error(
          searchData.detail || "Search initialization failed"
        );
      }

      // ======================================
      // 3. GET JOB ID (Snake_case Support)
      // ======================================
      const jobId =
        searchData.jobId ||
        searchData.job_id ||
        searchData.searchId ||
        searchData.search_id ||
        searchData.taskId;

      console.log("🆔 AI Job ID:", jobId);

      if (!jobId) {
        throw new Error("Backend did not return a job ID");
      }

      // ======================================
      // 4. GO TO SEARCHING PAGE
      // ======================================
      console.log("🔎 Opening AI searching page...");
      navigate(`/client/search/${jobId}`);

    } catch (error) {
      console.error("❌ Search Failed:", error);
      alert("Search Failed: " + (error.message || "Unknown Error"));
      setIsSearching(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📸 Find My Photos
      </h1>

      {!isSearching ? (
        <>
          <input
            type="text"
            placeholder="Event Code"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4 text-gray-700"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelfie(e.target.files[0])}
            className="mb-6 block text-sm text-gray-500"
          />

          <button
            onClick={() => handleSearch()}
            className="w-full bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            🔍 Find My Photos
          </button>
        </>
      ) : (
        <div className="text-center bg-gray-50 p-8 rounded-xl border border-gray-200">
          <p className="text-xl font-semibold text-gray-800 mb-4">
            Initializing Search...
          </p>

          <div className="w-full bg-gray-200 rounded-full h-5 mb-4 overflow-hidden">
            <div className="bg-purple-600 h-5 rounded-full animate-pulse w-full" />
          </div>

          <p className="text-sm text-gray-500 animate-pulse mt-2">
            Please wait, connecting to AI server...
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchPhotos;