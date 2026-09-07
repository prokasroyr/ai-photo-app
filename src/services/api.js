const API_BASE_URL = import.meta.env.VITE_API_URL;

// ১. সেলফি আপলোড (FormData)
export const uploadSelfie = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/upload-selfie`, {
    method: "POST",
    body: formData,
  });
  return await res.json();
};

// ২. ফেস সার্চ শুরু করা
export const startSearch = async (eventId, selfieUrl) => {
  const res = await fetch(`${API_BASE_URL}/start-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, selfieUrl }),
  });
  return await res.json();
};

// ৩. সার্চ স্ট্যাটাস দেখা (Polling)
export const getSearchStatus = async (jobId) => {
  const res = await fetch(`${API_BASE_URL}/search-status/${jobId}`);
  return await res.json();
};

// ৪. ইভেন্ট প্রসেস শুরু করা
export const processEvent = async (eventId) => {
  const res = await fetch(`${API_BASE_URL}/process-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId }),
  });
  return await res.json();
};

// ৫. জিও/জিপ (Zip) ফাইল ডাউনলোড
export const downloadZip = async (imageUrls, watermarkText = "") => {
  const res = await fetch(`${API_BASE_URL}/download-zip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrls, watermarkText }),
  });
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "photos.zip";
  a.click();
};