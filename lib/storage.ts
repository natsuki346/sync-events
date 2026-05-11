import { SyncEvent, Participant, TalkRequest, MyProfile } from "./types";

const EVENTS_KEY = "sync_events";
const MY_PROFILE_KEY = "sync_my_profile";
const JOINED_EVENTS_KEY = "sync_joined_events";
const participantsKey = (id: string) => `sync_participants_${id}`;
const requestsKey = (id: string) => `sync_requests_${id}`;

function safeGet<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function safeGetOne<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const storage = {
  // ─── Events ───────────────────────────────────────────────
  getEvents(): SyncEvent[] {
    return safeGet<SyncEvent>(EVENTS_KEY);
  },
  getEvent(id: string): SyncEvent | null {
    return this.getEvents().find((e) => e.id === id) ?? null;
  },
  saveEvent(event: SyncEvent): void {
    safeSet(EVENTS_KEY, [...this.getEvents(), event]);
  },

  // ─── My Profile ───────────────────────────────────────────
  getMyProfile(): MyProfile | null {
    return safeGetOne<MyProfile>(MY_PROFILE_KEY);
  },
  saveMyProfile(profile: MyProfile): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(MY_PROFILE_KEY, JSON.stringify(profile));
  },

  // ─── Joined Events ────────────────────────────────────────
  getJoinedEventIds(): string[] {
    return safeGet<string>(JOINED_EVENTS_KEY);
  },
  hasJoined(eventId: string): boolean {
    return this.getJoinedEventIds().includes(eventId);
  },
  addJoinedEventId(eventId: string): void {
    const ids = this.getJoinedEventIds();
    if (!ids.includes(eventId)) {
      safeSet(JOINED_EVENTS_KEY, [...ids, eventId]);
    }
  },

  // ─── Participants ─────────────────────────────────────────
  getParticipants(eventId: string): Participant[] {
    return safeGet<Participant>(participantsKey(eventId));
  },
  getParticipant(eventId: string, participantId: string): Participant | null {
    return (
      this.getParticipants(eventId).find((p) => p.id === participantId) ?? null
    );
  },
  saveParticipant(participant: Participant): void {
    const list = this.getParticipants(participant.eventId);
    safeSet(participantsKey(participant.eventId), [...list, participant]);
  },

  // ─── Requests ─────────────────────────────────────────────
  getRequests(eventId: string): TalkRequest[] {
    return safeGet<TalkRequest>(requestsKey(eventId));
  },
  saveRequest(request: TalkRequest): void {
    const list = this.getRequests(request.eventId);
    safeSet(requestsKey(request.eventId), [...list, request]);
  },
  hasRequested(eventId: string, fromId: string, toId: string): boolean {
    return this.getRequests(eventId).some(
      (r) => r.fromId === fromId && r.toId === toId
    );
  },
  getRequestsTo(eventId: string, toId: string): TalkRequest[] {
    return this.getRequests(eventId).filter((r) => r.toId === toId);
  },
};
