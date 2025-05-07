import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import path from "path";

// Open database connection
const dbPath = path.resolve("C:/Andet/HTXProgrammering/Git/InformatikEksamen/somename.db");
const db = new sqlite3.Database(dbPath);

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const card_id = searchParams.get("card_id");

  if (!card_id) {
    return NextResponse.json({ error: "card_id is required" }, { status: 400 });
  }

  try {
    // Get student ID from card
    const studentRows = await runQuery(
      "SELECT student_id FROM cards WHERE card_id = ?",
      [card_id]
    );
    if (studentRows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const studentID = studentRows[0].student_id;

    // Get absence states
    const absenceRows = await runQuery(
      "SELECT absence, class_schedule_id FROM class_schedule_student_absence WHERE student_id = ?",
      [studentID]
    );

    const currentTime = new Date();
    const classesAbsence = {};
    let amountOfZero = 0;
    let amountOfOne = 0;

    for (const row of absenceRows) {
      const { absence, class_schedule_id } = row;

      // Get class_id and start_time
      const scheduleRows = await runQuery(
        "SELECT class_id, start_time FROM class_schedule WHERE class_schedule_id = ?",
        [class_schedule_id]
      );
      if (scheduleRows.length === 0) continue;

      const { class_id, start_time } = scheduleRows[0];
      const startTime = new Date(start_time);

      if (startTime <= currentTime) {
        if (absence === 0) amountOfZero++;
        if (absence === 1) amountOfOne++;

        const classRows = await runQuery(
          "SELECT name FROM classes WHERE class_id = ?",
          [class_id]
        );
        if (classRows.length === 0) continue;

        const name = classRows[0].name;
        const statename = absence === 1 ? "participated" : "absence";

        if (!classesAbsence[name]) classesAbsence[name] = {};
        if (!classesAbsence[name][statename]) classesAbsence[name][statename] = 0;
        classesAbsence[name][statename]++;
      }
    }

    const percent =
      amountOfOne + amountOfZero > 0
        ? Math.round((amountOfZero / (amountOfOne + amountOfZero)) * 100)
        : 0;

    return NextResponse.json({
      classesAbsence,
      stats: {
        absence: amountOfZero,
        participated: amountOfOne,
        percent_absence: `${percent}%`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }


    //USECASE:
    // const res = await fetch("/api/addstudent?card_id=1234");
    // const data = await res.json();
    // console.log(data);
}
