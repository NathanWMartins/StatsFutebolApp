import {
    addDoc,
    collection,
    serverTimestamp,
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