// Mirrors the original Uploader.vue title-generation branches exactly,
// including the combinations that intentionally fall through to "".
export default function buildVideoTitle({ artist, title, country, year }) {
  if (artist && title && country && year) {
    return `${artist} - ${title} (${country}, ${year})`;
  }
  if (artist && title && country && !year) {
    return `${artist} - ${title} (${country})`;
  }
  if (artist && title && !country && year) {
    return `${artist} - ${title} (${year})`;
  }
  if (artist && title && !country && !year) {
    return `${artist} - ${title}`;
  }
  if (artist && !title && !country && !year) {
    return `${artist}`;
  }
  if (!artist && title && !country && !year) {
    return `${title}`;
  }
  if (artist && !title && country && year) {
    return `${artist} - XXXXXXXXX (${country}, ${year})`;
  }
  return "";
}
