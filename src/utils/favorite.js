export const getFavorites = (eventId) => {
  const favs = localStorage.getItem(`favs_${eventId}`);
  return favs ? JSON.parse(favs) : [];
};

export const toggleFavorite = (eventId, photo) => {
  let favs = getFavorites(eventId);
  const photoUrl = photo.imageUrl || photo.cloudinaryUrl || photo.url;
  const exists = favs.some((item) => (item.imageUrl || item.url) === photoUrl);

  if (exists) {
    favs = favs.filter((item) => (item.imageUrl || item.url) !== photoUrl);
  } else {
    favs.push(photo);
  }
  localStorage.setItem(`favs_${eventId}`, JSON.stringify(favs));
  return favs;
};