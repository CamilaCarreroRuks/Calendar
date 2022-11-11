import { firestoreDB } from "src/config/firebase/index";
import { collection, doc} from "firebase/firestore";
import * as Constants from "src/constants";

const refs = {
  addEvent: () => collection(firestoreDB, Constants.COLLECTIONS.EVENTS),
  getEvents: () => collection(firestoreDB, Constants.COLLECTIONS.EVENTS),
  modifyEvent: (id) => doc(firestoreDB, Constants.COLLECTIONS.EVENTS, id),
  deleteEvent: (id) => doc(firestoreDB, Constants.COLLECTIONS.EVENTS, id),
};

export { refs };
