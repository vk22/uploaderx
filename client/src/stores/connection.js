import { defineStore } from "pinia";
import { socket } from "@/socket";

export const useConnectionStore = defineStore("connection", {
  state: () => ({
    isConnected: false,
  }),

  actions: {
    bindEvents() {
      socket.on("connect", () => {
        this.isConnected = true;
      });

      socket.on("disconnect", () => {
        this.isConnected = false;
      });

    },

    createItem(label) {
        const item = {
            id: Date.now(), // temporary ID for v-for key
            label
        };
        this.items.push(item);

        socket.emit("item:create", { label }, (res) => {
            item.id = res.data;
        });
    },

    connect() {
      socket.connect();
    }
  },
});