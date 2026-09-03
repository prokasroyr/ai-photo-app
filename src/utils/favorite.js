// LocalStorage থেকে ফেভারিট ছবির লিস্ট পড়া
export const getFavorites = (eventId) => {
  const favorites = localStorage.getItem(`fav_photos_${eventId}`);
  return favorites ? JSON.parse(favorites) : [];
};

// কোনো ছবি ফেভারিট আছে কি না তা চেক করা
export const isFavorite = (eventId, photoUrl) => {
  const favorites = getFavorites(eventId);
  return favorites.some((item) => item.imageUrl === photoUrl);
};

// ফেভারিট যুক্ত বা রিমুভ করা (Toggle)
export const toggleFavorite = (eventId, photo) => {
  let favorites = getFavorites(eventId);
  const exists = favorites.some((item) => item.imageUrl === photo.imageUrl);

  if (exists) {
    // আগে থেকে থাকলে রিমুভ করব
    favorites = favorites.filter((item) => item.imageUrl !== photo.imageUrl);
  } else {
    // না থাকলে যোগ করব
    favorites.push(photo);
  }

  localStorage.setItem(`fav_photos_${eventId}`, JSON.stringify(favorites));
  return favorites;
};