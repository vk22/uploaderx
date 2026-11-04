const Discogs = require("disconnect").Client;

const db = new Discogs({
  consumerKey: process.env.DISCOGS_CONSUMER_KEY,
  consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
}).database();

const wantlist = new Discogs({
  userToken: process.env.DISCOGS_USER_TOKEN,
}).user().wantlist();

async function search(query) {
  return db.search(query);
}

async function getMaster(masterId) {
  return db.getMaster(masterId);
}

async function getRelease(releaseId) {
  return db.getRelease(releaseId);
}

async function getImage(coverUri) {
  return db.getImage(coverUri);
}

async function getArtistsData(artists) {
  const artistData = [];
  for (const artist of artists) {
    try {
      const fetchedArtist = await db.getArtist(artist.id);
      if (fetchedArtist.members) {
        fetchedArtist.members.forEach((member) => artistData.push(member));
      } else {
        artistData.push({
          name: fetchedArtist.name,
          id: fetchedArtist.id,
        });
      }
    } catch (err) {
      // best-effort enrichment: skip artists that fail to resolve
    }
  }
  return artistData;
}

async function getWantlist(username) {
  return wantlist.getReleases(username);
}

async function addToWantlist(username, releaseID) {
  return wantlist.addRelease(username, releaseID);
}

async function removeFromWantlist(username, releaseID) {
  return wantlist.removeRelease(username, releaseID);
}

module.exports = {
  search,
  getMaster,
  getRelease,
  getImage,
  getArtistsData,
  getWantlist,
  addToWantlist,
  removeFromWantlist,
};
