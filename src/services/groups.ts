import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

export const createGroup = async (
  userId: string,
  name: string,
) => {
  const groupRef = await addDoc(collection(db, "groups"), {
    name,
    ownerId: userId,
    inviteCode: crypto.randomUUID()
      .replace(/-/g, "")
      .substring(0, 8)
      .toUpperCase(),
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "groupMembers", `${groupRef.id}_${userId}`),
    {
      groupId: groupRef.id,
      userId,
      role: "admin",
      joinedAt: serverTimestamp(),
    },
  );

  return groupRef.id;
};