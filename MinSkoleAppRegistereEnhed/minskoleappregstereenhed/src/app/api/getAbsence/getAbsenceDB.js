import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import path from "path";
const { DateTime } = require('luxon'); // optional, for datetime formatting

// Open database connection
const dbPath = path.resolve("C:/Andet/HTXProgrammering/Git/InformatikEksamen/somename.db");
const db = new sqlite3.Database(dbPath);

function getStudentIdFromCard(card_id) {
	const q = `SELECT student_id FROM STUDENTS
			   WHERE card_id = ?
			   ORDER BY student_id ASC LIMIT 1`;
  
	return new Promise((resolve, reject) => {
	  db.get(q, [card_id], (err, row) => {
		if (err) {
		  console.error("Error executing query:", err);
		  return reject(err);
		}
  
		if (!row) {
		  console.log("NO STUDENT_ID WAS FOUND for card_id:", card_id);
		  return resolve(null);
		}
  
		console.log("Student ID found:", row.student_id);
		resolve(row.student_id);
	  });
	});
}
  

async function studentAbsence(card_id, subjectID = 0) {
	const studentID = await getStudentIdFromCard(card_id);
	if (!studentID) return 0;
  
	const currentTime = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
  
	const getResponse = (getAbsence) => {
	  return new Promise((resolve, reject) => {
		let q = `SELECT count(*) AS count FROM student_classes
				 JOIN class_schedule ON student_classes.class_id = class_schedule.class_id
				 JOIN class_schedule_student_absence ON student_classes.student_id = class_schedule_student_absence.student_id
				 WHERE student_classes.student_id = ?
				 AND class_schedule.start_time <= ?
				 AND class_schedule.end_time >= ?
				 AND class_schedule_student_absence.absence = ?`;
  
		const params = [studentID, currentTime, currentTime, getAbsence];
  
		if (subjectID > 0) {
		  q += ` AND class_schedule.class_id = ?`;
		  params.push(subjectID);
		}
  
		db.get(q, params, (err, row) => {
		  if (err) return reject(err);
		  resolve(row?.count || 0);
		});
	  });
	};
  
	const absent = await getResponse(1);
	const present = await getResponse(0);
  
	console.log(absent, present);
	if (absent + present === 0) return 0;
	return Math.floor((absent / (absent + present)) * 100);
}

async function getAllSubjectAbsence(card_id) {
	const studentID = await getStudentIdFromCard(card_id);
	if (!studentID) return [];
  
	const q = `SELECT classes.class_id, classes.name FROM classes
			   JOIN student_classes ON classes.class_id = student_classes.class_id
			   WHERE student_classes.student_id = ?`;
  
	return new Promise((resolve, reject) => {
	  db.all(q, [studentID], async (err, allClassIDs) => {
		if (err) {
		  console.error("Error querying classes:", err);
		  return reject(err);
		}
  
		const results = [];
		for (const { class_id, name } of allClassIDs) {
		  const absenceRate = await studentAbsence(card_id, class_id);
		  results.push({ name, value: absenceRate });
		}
  
		resolve(results);
	  });
	});
  }
  

function getTotalAbsence(card_id){
	const absenceRate = studentAbsence(card_id, 0) || 0;

	let totalArr = [{"name" : "Ikke Godkendt", "value" : absenceRate}];

	// console.log(totalArr);
	return totalArr
}

export { getAllSubjectAbsence, getTotalAbsence };


// getAllSubjectAbsence("69A164A3");
// getTotalAbsence("69A164A3");