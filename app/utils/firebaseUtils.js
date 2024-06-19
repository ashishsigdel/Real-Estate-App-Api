import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import config from "../config/firebase.js";
import { initializeApp } from "firebase/app";
import fs from "fs";
import path from "path";

initializeApp(config.firebaseConfig);

const storage = getStorage();

export const getUrlFromFirebase = async (file) => {
  const { path, filename, mimetype } = file;

  // Read the file from the local filesystem
  const fileBuffer = fs.readFileSync(path);

  // Create a reference in Firebase Storage
  const storageRef = ref(storage, `user-images/${filename}`);

  // Create metadata for the file
  const metadata = {
    contentType: mimetype,
  };

  const snapshot = await uploadBytesResumable(storageRef, fileBuffer, metadata);

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
};
