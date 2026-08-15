import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  createdAt?: unknown;
}

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

export async function getUserGroups(userId: string,): Promise<Group[]> {
  const membersQuery = query(
    collection(db, "groupMembers"),
    where("userId", "==", userId),
  );

  const membersSnapshot = await getDocs(membersQuery);

  const groups: Group[] = [];

  for (const member of membersSnapshot.docs){
    const groupId = member.data().groupId;

    const groupSnapshot = await getDocs(
      query(
        collection(db, "groups"),
        where("__name__", "==", groupId),
      ),
    );

    if (!groupSnapshot.empty){
      const group = groupSnapshot.docs[0];

      groups.push({
        id: group.id,
        ...(group.data() as Omit<Group, "id">),
      });
    }
  }

  return groups;
}