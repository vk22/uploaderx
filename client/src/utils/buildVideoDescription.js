export default function buildVideoDescription({ album, link }) {
  if (album && link) {
    return `Album: ${album}\n${link}`;
  }
  if (album && !link) {
    return `Album: ${album}`;
  }
  return "";
}
