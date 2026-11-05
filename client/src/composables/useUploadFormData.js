// Owns a single FormData instance shared across the upload flow.
// reset() must be called whenever the user removes/replaces files so
// stale fields from a previous attempt don't leak into the next upload.
export default function useUploadFormData() {
  let formData = new FormData();

  function append(key, value) {
    formData.append(key, value);
  }

  function remove(key) {
    formData.delete(key);
  }

  function reset() {
    formData = new FormData();
  }

  function get() {
    return formData;
  }

  return { append, remove, reset, get };
}
