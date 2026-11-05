import { useMainStore } from "@/stores/main";

// Shows a dismissible alert in the main store, auto-removing it after a
// delay proportional to the message length (same timing as before).
export default function notifyUploader(data) {
  const mainStore = useMainStore();
  const alert = { ...data, id: new Date().getTime() };

  setTimeout(() => {
    mainStore.addAlert(alert);
  }, 500);

  if (alert.active) {
    setTimeout(() => {
      mainStore.removeAlert({ id: alert.id });
    }, alert.message.length * 120);
  }
}
