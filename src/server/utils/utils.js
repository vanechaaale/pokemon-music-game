
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function loadSongs(musicSources, songTypes) {
  const fileMap = {
    red_blue: "red_blue.json",
    gold_silver: "gold_silver.json",
    theme_songs: "theme_songs.json",
  };

  const allSongs = [];
  for (const source of musicSources) {
    const fileName = fileMap[source];
    if (!fileName) continue;

    const filePath = path.join(__dirname, "../../public", fileName);
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      const songs = JSON.parse(data);
      allSongs.push(...songs);
    } catch (err) {
      console.error(`Failed to load ${fileName}:`, err.message);
    }
  }

  // Filter by song types
  return allSongs.filter((song) => songTypes.includes(song.type));
}