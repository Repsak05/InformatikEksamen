import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import path from "path";
import { promises as fs } from "fs";


//const dbPath = path.resolve("C:/Andet/HTXProgrammering/Git/InformatikEksamen/somename.db"); // Kasper Path
const dbPath = path.resolve("C:/Users/nordi/OneDrive/Coding/InformatikEksamen/somename.db"); // Nordin Path

export async function POST(req) {
  try {
    const body = await req.json();
    const { rfid, name } = body;

    if (!rfid || !name) {
      return NextResponse.json({ success: false, error: "RFID og navn kræves" }, { status: 400 });
    }

    await fs.access(dbPath).catch(() => {
      throw new Error("Databasen findes ikke på den angivne sti.");
    });

    const db = new sqlite3.Database(dbPath);

    // Opret tabellen hvis den ikke findes
    db.run(
      `CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT NOT NULL,
        name TEXT NOT NULL
      )`
    );

    // Indsæt data
    db.run(
      `INSERT INTO students (card_id, name) VALUES (?, ?)`,
      [rfid, name],
      function (err) {
        if (err) {
          console.error("Fejl ved indsættelse:", err);
        }
      }
    );

    db.close();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API-fejl:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
