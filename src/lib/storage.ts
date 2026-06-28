export type RecipientTime = "1年后" | "6个月后" | "3年后" | "5年后";
export type LetterStatus = "draft" | "sealed" | "replied" | "opened";
export type Mood = "期待" | "焦虑" | "充满干劲" | "有点难过" | "迷茫" | "平静";

export interface TimeCapsuleLetter {
  id: string;
  recipientTime: RecipientTime;
  content: string;
  wishes: string[];
  mood: string;
  createdAt: string;
  openAt: string;
  aiReply?: string;
  status: LetterStatus;
}

const STORAGE_KEY = "time-capsule-letters";
const STORAGE_CHANGE_EVENT = "capsule-storage-change";
const DEMO_MODE_KEY = "time-capsule-demo-mode";

function notifyStorageChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT));
  }
}

function generateId(): string {
  return "tc-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

export function calculateOpenDate(recipientTime: RecipientTime, demoMode = false): Date {
  const now = new Date();
  const result = new Date(now);
  if (demoMode) {
    result.setMinutes(result.getMinutes() + 3);
    return result;
  }
  switch (recipientTime) {
    case "6个月后":
      result.setMonth(result.getMonth() + 6);
      break;
    case "1年后":
      result.setFullYear(result.getFullYear() + 1);
      break;
    case "3年后":
      result.setFullYear(result.getFullYear() + 3);
      break;
    case "5年后":
      result.setFullYear(result.getFullYear() + 5);
      break;
  }
  return result;
}

export function getSalutation(recipientTime: RecipientTime): string {
  switch (recipientTime) {
    case "6个月后": return "半年后";
    case "1年后": return "一年后";
    case "3年后": return "三年后";
    case "5年后": return "五年后";
  }
}

export function formatDateCN(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function getTodayCN(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}年${m}月${d}日`;
}

export function getMonthYearCN(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}年${m}月`;
}

export function saveLetter(letter: Omit<TimeCapsuleLetter, "id" | "createdAt" | "status" | "openAt">): TimeCapsuleLetter {
  const letters = getLetters();
  const newLetter: TimeCapsuleLetter = {
    ...letter,
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: "sealed",
    openAt: calculateOpenDate(letter.recipientTime, isDemoMode()).toISOString(),
  };
  letters.unshift(newLetter);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
  notifyStorageChange();
  return newLetter;
}

export function getLetters(): TimeCapsuleLetter[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TimeCapsuleLetter[];
  } catch {
    return [];
  }
}

export function getLetterById(id: string): TimeCapsuleLetter | undefined {
  return getLetters().find((l) => l.id === id);
}

export function updateLetterReply(id: string, aiReply: string): void {
  const letters = getLetters();
  const index = letters.findIndex((l) => l.id === id);
  if (index !== -1) {
    letters[index].aiReply = aiReply;
    letters[index].status = "replied";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
    notifyStorageChange();
  }
}

export function deleteLetter(id: string): void {
  const letters = getLetters().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
  notifyStorageChange();
}

export function getLetterCount(): number {
  return getLetters().length;
}

export function getUnopenedCount(): number {
  return getLetters().filter((l) => l.status !== "opened").length;
}

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_MODE_KEY) === "true";
}

export function setDemoMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_MODE_KEY, String(enabled));
}

export function isLetterOpenable(letter: TimeCapsuleLetter): boolean {
  if (letter.status === "opened") return false;
  const openAt = letter.openAt ? new Date(letter.openAt) : new Date(0);
  return new Date() >= openAt;
}

export function openLetter(id: string): void {
  const letters = getLetters();
  const index = letters.findIndex((l) => l.id === id);
  if (index !== -1) {
    letters[index].status = "opened";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
    notifyStorageChange();
  }
}

// ===== Event-driven hooks =====

import { useState, useEffect } from "react";

export function useCapsuleCount(): { total: number; unopened: number } {
  const [counts, setCounts] = useState({ total: 0, unopened: 0 });

  useEffect(() => {
    const update = () => {
      const letters = getLetters();
      setCounts({
        total: letters.length,
        unopened: letters.filter((l) => l.status !== "opened").length,
      });
    };

    update();

    window.addEventListener(STORAGE_CHANGE_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return counts;
}
