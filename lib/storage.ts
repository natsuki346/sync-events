import { SyncEvent, Participant, TalkRequest } from "./types";

const EVENTS_KEY = "sync_events";
const participantsKey = (eventId: string) => `sync_participants_${eventId}`;
const requestsKey = (eventId: string) => `sync_requests_${eventId}`;
const myIdKey = (eventId: string) => `participant_${eventId}`;

function safeGet<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  // Events
  getEvents(): SyncEvent[] {
    return safeGet<SyncEvent>(EVENTS_KEY);
  },

  getEvent(id: string): SyncEvent | null {
    return this.getEvents().find((e) => e.id === id) ?? null;
  },

  saveEvent(event: SyncEvent): void {
    const events = this.getEvents();
    safeSet(EVENTS_KEY, [...events, event]);
  },

  // Participants
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

  // My ID
  getMyId(eventId: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(myIdKey(eventId));
  },

  setMyId(eventId: string, participantId: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(myIdKey(eventId), participantId);
  },

  // Requests
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
