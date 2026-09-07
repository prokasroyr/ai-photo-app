const AI_API_URL = "https://ai-photo-backend-8le8.onrender.com"; 

// LocalStorage থেকে স্টুডিওর নাম ফেচ করার ফাংশন
const getStudioName = () => {
  return localStorage.getItem("studioName") || "Your Studio Name";
};

/**
 * ওয়াটারমার্কসহ (নিচের কোণায়) একক JPG ছবি ডাউনলোড
 */
export const handleSingleDownload = async (imageUrl, filename = "photo.jpg") => {
  const watermarkText = getStudioName();

  try {
    const response = await fetch(`${AI_API_URL}/download-single`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        imageUrl, 
        image_url: imageUrl, 
        filename,
        watermarkText,
        watermark_text: watermarkText,
        position: "bottom_right", // ছবির নিচের ডান কোণায় ওয়াটারমার্ক
        watermark_position: "bottom_right"
      }),
    });

    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Single download error:", error);
    alert("ওয়াটারমার্কসহ ছবি ডাউনলোড করতে সমস্যা হয়েছে!");
  }
};

/**
 * ওয়াটারমার্কসহ একাধিক JPG ছবি অটোমেটিক ডাউনলোড
 */
export const handleMultipleDownloads = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) {
    alert("ডাউনলোড করার মতো কোনো ছবি পাওয়া যায়নি!");
    return;
  }

  for (let index = 0; index < imageUrls.length; index++) {
    const url = imageUrls[index];
    const filename = `photo_${index + 1}.jpg`;
    await handleSingleDownload(url, filename);
    
    // ব্রাউজার সিকিউরিটি ব্লকিং এড়াতে বিলম্ব
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
};