import axios from 'axios';

// আপনার FastAPI ব্যাকএন্ড URL
const AI_API_URL = "https://ai-photo-backend-8le8.onrender.com"; 

/**
 * একক ছবি ডাউনলোড করার ফাংশন (Watermark সহ/ছাড়া)
 */
export const handleSingleDownload = async (imageUrl, filename = "photo.jpg", watermarkText = null) => {
  try {
    const response = await axios.post(
      `${AI_API_URL}/download-single`,
      { imageUrl, filename, watermarkText },
      { responseType: 'blob' } // Direct browser download trigger করার জন্য
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Single download error:", error);
    alert("ছবি ডাউনলোড করতে সমস্যা হয়েছে!");
  }
};

/**
 * একাধিক ছবি একসাথে ZIP করে ডাউনলোড করার ফাংশন
 */
export const handleZipDownload = async (imageUrls, zipName = "matched_photos.zip", watermarkText = null) => {
  try {
    const response = await axios.post(
      `${AI_API_URL}/download-zip`,
      { imageUrls, zipName, watermarkText },
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', zipName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("ZIP download error:", error);
    alert("ZIP ফাইল তৈরি করতে সমস্যা হয়েছে!");
  }
};