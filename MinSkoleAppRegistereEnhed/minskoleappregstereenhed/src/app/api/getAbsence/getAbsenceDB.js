import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import path from "path";
const { DateTime } = require('luxon'); // optional, for datetime formatting

// Open database connection
const dbPath = path.resolve("C:/Users/nordi/OneDrive/Coding/InformatikEksamen/somename.db"); // Nordin Path


const db = new sqlite3.Database(dbPath);

async function getStudentIdFromCard(card_id) {
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

async function studentAbsence(card_id, subjectID = 0, fromDate, toDate) {
	const studentID = await getStudentIdFromCard(card_id);
	if (!studentID) return 0;
	
	if (fromDate) fromDate = DateTime.fromISO(fromDate).toISODate();
	if (toDate) toDate = DateTime.fromISO(toDate).toISODate();
	// console.log("Dates: ", fromDate, "\n", toDate);
  
	const currentTime = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
  
	const getResponse = (getAbsence) => {
	  return new Promise((resolve, reject) => {
		let q =`SELECT count(DISTINCT class_schedule.class_schedule_id) FROM student_classes
				JOIN class_schedule 
					ON student_classes.class_id = class_schedule.class_id
				JOIN class_schedule_student_absence 
					ON student_classes.student_id = class_schedule_student_absence.student_id
					AND class_schedule.class_schedule_id = class_schedule_student_absence.class_schedule_id
				WHERE student_classes.student_id = ?
				AND class_schedule.start_time <= ?
				AND class_schedule_student_absence.absence = ?`
  
		const params = [studentID, currentTime, getAbsence];
		
		if(fromDate && toDate){
			
			q += `\nAND (
							DATE(?) BETWEEN DATE(class_schedule.start_time) AND DATE(class_schedule.end_time)
						OR	DATE(?) BETWEEN DATE(class_schedule.start_time) AND DATE(class_schedule.end_time)
					)`;
			params.push(fromDate);
			params.push(toDate);
		}else{
			if(fromDate){
				q += `\nAND DATE(class_schedule.end_time) = DATE(?)`
				params.push(fromDate);
			}
			if(toDate){
				q += `\nAND DATE(class_schedule.end_time) = DATE(?)`
				params.push(toDate);
			}
		}

		if (subjectID > 0) {
		  q += `\nAND class_schedule.class_id = ?`;
		  params.push(subjectID);
		}
  
		db.get(q, params, (err, row) => {
		  if (err) return reject(err);
		//   console.log(params, q, "ROW FOUND: ", row);
		  const amountCount = Object.values(row)[0];
		//   console.log("RETURNED: ", amountCount);
		  resolve(amountCount || 0);
		});
	  });
	};
  
	const absent = await getResponse(1);
	const present = await getResponse(0);
  
	console.log("absent: ", absent, "present: ", present);
	if (absent + present === 0) return 0;
	console.log("Percentage: ", Math.floor((absent / (absent + present)) * 100));
	return Math.floor((absent / (absent + present)) * 100);
}

async function getAllSubjectAbsence(card_id, fromDate, toDate) {
	const studentID = await getStudentIdFromCard(card_id, );
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
		  const absenceRate = await studentAbsence(card_id, class_id, fromDate, toDate);
		  results.push({"name" : name, "value" : absenceRate });
		}
  
		resolve(results);
	  });
	});
}
  
async function getTotalAbsence(card_id, dateFrom, dateTo){
	const absenceRate = await studentAbsence(card_id, 0, dateFrom, dateTo);
	// console.log("Abesence rate gooten: ", absenceRate);

	let totalArr = [
		{"name" : "Ikke Godkendt", "value" : absenceRate},
		{"name" : "Til stede", "value" : 100 - absenceRate},
	];

	return totalArr
}

export { getAllSubjectAbsence, getTotalAbsence };
