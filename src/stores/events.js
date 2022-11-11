import { defineStore } from "pinia";
import { addDoc, getDocs, getDoc, updateDoc, query, where, deleteDoc } from "firebase/firestore";
import { refs } from "src/config/firebase/firestoreDatabase";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export const useEvents = defineStore("events", {
  state: () => ({}),
  getters: {},
  actions: {
    async getEvents() {
      const querySnapshot = await getDocs(refs.getEvents());
      let fbRows = [];
      querySnapshot.forEach((doc) => {
        const row = {
          id: doc.id,
          date: doc.data().date,
          description: doc.data().description,
        };
        fbRows.push(row);
      });
      if (fbRows) {
        return {
          value: fbRows,
          status: 200,
        };
      } else {
        return { status: 400 };
      }
    },
    async addEvent(payload) {
      if (payload) {
        const docRef = await addDoc(refs.addEvent(), {
          date: payload.date,
          description: payload.description,
        });
        if (docRef.id) {
          return {
            value: docRef.id,
            status: 200,
          };
        } else {
          return { status: 400 };
        }
      } else {
        return { status: 400 };
      }
    },
    async listOneProduct(payload) {
      const ref = refs.getProducts();
      const q = query(ref, where("name", "==", payload));
      const response = await getDocs(q);
      let fbRows = [];
      response.forEach((doc) => {
        const row = {
          id: doc.id,
          stock: doc.data().stock,
          price: doc.data().price,
        };
        fbRows.push(row);
      });
      if (fbRows) {
        return {
          value: fbRows,
          status: 200,
        };
      } else {
        return { status: 400 };
      }
    },
    async modifyEvent(payload) {
      if (payload) {
        try {
          await updateDoc(refs.modifyEvent(payload.id), {
            date: payload.date,
            description: payload.description,
          });
          return { status: 200 };
        } catch (error) {
          return { status: 400, error: error };
        }
      } else {
        return { status: 400, error: error };
      }
    },
    async deleteEvent(payload) {
      if (payload) {
        try {
          await deleteDoc(refs.deleteEvent(payload));
          return { status: 200 };
        } catch (error) {
          return { status: 400, error: error };
        }
      } else {
        return { status: 400};
      }
    },
  },
});
