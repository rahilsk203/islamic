import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Storage-backed session helpers
export interface StoredSessionMeta {
  id: string;
  title: string;
  updatedAt: number;
}

export interface StoredSessionData {
  id: string;
  title: string;
  updatedAt: number;
  messages: Array<{ id: number; message: string; isUser: boolean }>;
}

const SESSIONS_INDEX_KEY = 'islamicai.sessions.index';
const SESSION_DATA_PREFIX = 'islamicai.session.';

export function readSessionsIndex(): StoredSessionMeta[] {
  try {
    const raw = localStorage.getItem(SESSIONS_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredSessionMeta[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSessionsIndex(items: StoredSessionMeta[], max: number = 20) {
  const sorted = [...items].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, max);
  localStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(sorted));
}

export function readSession(sessionId: string): StoredSessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_DATA_PREFIX + sessionId);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSessionData;
  } catch {
    return null;
  }
}

export function writeSession(data: StoredSessionData) {
  localStorage.setItem(SESSION_DATA_PREFIX + data.id, JSON.stringify(data));
  const index = readSessionsIndex();
  const existingIdx = index.findIndex(s => s.id === data.id);
  const meta: StoredSessionMeta = { id: data.id, title: data.title, updatedAt: data.updatedAt };
  if (existingIdx >= 0) index.splice(existingIdx, 1);
  index.unshift(meta);
  writeSessionsIndex(index);
}

export function deleteSession(sessionId: string) {
  localStorage.removeItem(SESSION_DATA_PREFIX + sessionId);
  const index = readSessionsIndex().filter(s => s.id !== sessionId);
  writeSessionsIndex(index);
}

export function generateSessionTitleFromMessage(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'New Chat';
  return cleaned.length > 48 ? cleaned.slice(0, 45) + '…' : cleaned;
}

export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), wait);
  };
}