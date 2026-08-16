import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { db } from "../config/firebase";

export interface MatchPlayer {
    userId: string;
    name: string;
    photoURL?: string | null;

    team: "A" | "B";

    goals?: number;
    assists?: number;

    yellowCards?: number;
    redCards?: number;

    mvp?: boolean;
}

export interface Match {
    id: string;
    groupId: string;
    date: string;
    scoreA: number;
    scoreB: number;
    photoBase64?: string | null;
    players: MatchPlayer[];
    createdBy: string;
    createdAt?: unknown;
}

export async function createMatch(
    groupId: string,
    createdBy: string,
    date: string,
    scoreA: number,
    scoreB: number,
    players: MatchPlayer[],
    photoBase64?: string | null,
): Promise<string> {
    const matchRef = await addDoc(
        collection(db, "matches"),
        {
            groupId,
            createdBy,
            date,
            scoreA,
            scoreB,
            players,
            photoBase64:
                photoBase64 || null,
            createdAt: serverTimestamp(),
        },
    );

    return matchRef.id;
}

export async function getMatchById(
    matchId: string,
): Promise<Match | null> {
    const matchRef = doc(db, "matches", matchId);

    const matchSnapshot = await getDoc(matchRef);

    if (!matchSnapshot.exists()) {
        return null;
    }

    return {
        id: matchSnapshot.id,
        ...(matchSnapshot.data() as Omit<Match, "id">),
    };
}

export async function getGroupMatches(
    groupId: string,
): Promise<Match[]> {
    const matchesQuery = query(
        collection(db, "matches"),
        where("groupId", "==", groupId),
    );

    const snapshot =
        await getDocs(matchesQuery);

    return snapshot.docs
        .map((document) => ({
            id: document.id,
            ...(document.data() as Omit<
                Match,
                "id"
            >),
        }))
        .sort((a, b) => {
            const dateA =
                new Date(a.date).getTime();

            const dateB =
                new Date(b.date).getTime();

            return dateB - dateA;
        });
}