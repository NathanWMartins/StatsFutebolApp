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

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  name: string;
  photoURL?: string | null;
  role: "admin" | "member";
  joinedAt?: unknown;
}

export async function getGroupMembers(
  groupId: string,
): Promise<GroupMember[]> {
  const membersQuery = query(
    collection(db, "groupMembers"),
    where("groupId", "==", groupId),
  );

  const snapshot = await getDocs(membersQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<GroupMember, "id">),
  }));
}

export async function createGroup(
  userId: string,
  name: string,
  userName: string,
  photoURL?: string | null,
): Promise<string> {
  const groupRef = await addDoc(
    collection(db, "groups"),
    {
      name,
      ownerId: userId,
      inviteCode: crypto
        .randomUUID()
        .replace(/-/g, "")
        .substring(0, 8)
        .toUpperCase(),
      createdAt: serverTimestamp(),
    },
  );

  const memberRef = doc(
    db,
    "groupMembers",
    `${groupRef.id}_${userId}`,
  );

  await setDoc(memberRef, {
    groupId: groupRef.id,
    userId,
    role: "admin",
    name: userName,
    photoURL: photoURL || null,
    joinedAt: serverTimestamp(),
  });

  return groupRef.id;
}

export async function getUserGroups(userId: string,): Promise<Group[]> {
  const membersQuery = query(
    collection(db, "groupMembers"),
    where("userId", "==", userId),
  );

  const membersSnapshot = await getDocs(membersQuery);

  const groups: Group[] = [];

  for (const member of membersSnapshot.docs) {
    const groupId = member.data().groupId;

    const groupSnapshot = await getDocs(
      query(
        collection(db, "groups"),
        where("__name__", "==", groupId),
      ),
    );

    if (!groupSnapshot.empty) {
      const group = groupSnapshot.docs[0];

      groups.push({
        id: group.id,
        ...(group.data() as Omit<Group, "id">),
      });
    }
  }

  return groups;
}

export async function getGroupById(groupId: string,): Promise<Group | null> {
  const groupRef = doc(db, "groups", groupId);

  const groupSnapshot = await getDoc(groupRef);

  if (!groupSnapshot.exists()) {
    return null;
  }

  return {
    id: groupSnapshot.id,
    ...(groupSnapshot.data() as Omit<Group, "id">),
  };
}

export async function getGroupByInviteCode(
  inviteCode: string,
): Promise<Group | null> {
  const groupsQuery = query(
    collection(db, "groups"),
    where("inviteCode", "==", inviteCode),
  );

  const snapshot = await getDocs(groupsQuery);

  if (snapshot.empty) {
    return null;
  }

  const groupDoc = snapshot.docs[0];

  return {
    id: groupDoc.id,
    ...(groupDoc.data() as Omit<Group, "id">),
  };
}

export async function joinGroup(
  groupId: string,
  userId: string,
  userName: string,
  photoURL?: string | null,
): Promise<void> {
  const memberRef = doc(
    db,
    "groupMembers",
    `${groupId}_${userId}`,
  );

  const memberSnapshot = await getDoc(memberRef);

  if (memberSnapshot.exists()) {
    return;
  }

  await setDoc(memberRef, {
    groupId,
    userId,
    name: userName,
    photoURL: photoURL || null,
    role: "member",
    joinedAt: serverTimestamp(),
  });
}