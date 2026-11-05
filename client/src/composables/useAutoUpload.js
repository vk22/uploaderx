import { ref } from "vue";
import axios from "axios";

export default function useAutoUpload({ authenticated, user }) {
  const autoUploadUser = ref("102814452894667054158");

  async function startAutoUpload() {
    let data;
    if (authenticated.value) {
      if (user.value.id === autoUploadUser.value) {
        data = {
          userID: user.value.id,
          uploadTemplate: "2",
          privacyStatus: "unlisted",
        };
      }
      await axios.post("/api/start-auto-upload", { data });
    }
  }

  return { autoUploadUser, startAutoUpload };
}
