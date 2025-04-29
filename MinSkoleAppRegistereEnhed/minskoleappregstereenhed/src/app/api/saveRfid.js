import sqlite3 from "sqlite3";
import path from "path";

// Connect to SQLite database
const db = new sqlite3.Database(path.resolve("C:/Users/nordi/OneDrive/Coding/InformatikEksamen/somename.db"));

export default function handler(req, res) {
  if (req.method === "POST") {
    const { rfid } = req.body;

    // Validate RFID
    if (!rfid) {
      return res.status(400).json({ error: "RFID is required" });
    }

    // Insert RFID into the database
    const query = "INSERT INTO studenter (rfid) VALUES (?)";
    db.run(query, [rfid], function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to insert RFID" });
      }

      // Send success response
      res.status(200).json({ 
        message: "RFID saved successfully",
        id: this.lastID
      });
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}