import sqlite3
import serial
from datetime import datetime

# Initital setup
DB_NAME = "somename.db"
TABLE_NAME = "arrivals"
COM_PORT = 'COM10'
BAUD = 9600

SCANNER_CLASSROOM = "D2354"

conn = sqlite3.connect(DB_NAME)
cursor = conn.cursor()

# Create table if not alredy made
def createTables():
    cursor.execute(f'''CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        card_id TEXT, 
                        time DATETIME,
                        checked_in INTEGER)''')

    # School
    cursor.execute('''CREATE TABLE IF NOT EXISTS schools ( 
                        school_id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        name TEXT)''')

    # Teachers
    cursor.execute('''CREATE TABLE IF NOT EXISTS teachers ( 
                        teacher_id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        name TEXT)''')

    # Classes
    cursor.execute('''CREATE TABLE IF NOT EXISTS classes ( 
                        class_id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        name TEXT,
                        school_id INTEGER,
                        FOREIGN KEY (school_id) REFERENCES schools(school_id))''')

    # Students
    cursor.execute('''CREATE TABLE IF NOT EXISTS students ( 
                        student_id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        card_id TEXT,
                        name TEXT)''')

    # StudentClasses
    cursor.execute('''CREATE TABLE IF NOT EXISTS student_classes ( 
                        student_id INTEGER,
                        class_id INTEGER,
                        PRIMARY KEY (student_id, class_id),
                        FOREIGN KEY (student_id) REFERENCES students(student_id),
                        FOREIGN KEY (class_id) REFERENCES classes(class_id))''')

    # TeacherClasses
    cursor.execute('''CREATE TABLE IF NOT EXISTS teacher_classes ( 
                        teacher_id INTEGER,
                        class_id INTEGER,
                        PRIMARY KEY (teacher_id, class_id),
                        FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
                        FOREIGN KEY (class_id) REFERENCES classes(class_id))''')

    # ClassSchedule
    cursor.execute('''CREATE TABLE IF NOT EXISTS class_schedule ( 
                        class_schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        class_id INTEGER,
                        start_time DATETIME,
                        end_time DATETIME,
                        classroom TEXT,
                        FOREIGN KEY (class_id) REFERENCES classes(class_id))''')

    # ClassScheduleStudentAbsence
    cursor.execute('''CREATE TABLE IF NOT EXISTS class_schedule_student_absence ( 
                        class_schedule_id INTEGER,
                        student_id INTEGER,
                        absence INTEGER,
                        PRIMARY KEY (class_schedule_id, student_id),
                        FOREIGN KEY (class_schedule_id) REFERENCES class_schedule(class_schedule_id),
                        FOREIGN KEY (student_id) REFERENCES students(student_id))''')

createTables()

#!-----------------------------------------------------------------------------------
#!------------------------ THINGS THAT MUST BE DONE MANUALLY ------------------------
#!-----------------------------------------------------------------------------------

def addSchool(name): #Issue: Can be multiple with same name
    q = f'''INSERT INTO schools (name)
        VALUES ("{name}");'''
        
    cursor.execute(q)

def addTeacher(name):
    q = f'''INSERT INTO teachers (name)
            VALUES ("{name}");'''
    
    cursor.execute(q)

def addStudent(name, cardID): #Should card_id be the unique identifier? - what if card changes...
    q = f'''INSERT INTO students (name, card_id)
            VALUES ("{name}", "{cardID}");'''
    
    cursor.execute(q)

def addClass(name, schoolID = 1):
    q = f'''INSERT INTO classes (name, school_id)
            VALUES ("{name}", {schoolID});'''
    
    cursor.execute(q)

def addStudentToClass(studentID, classID):
    q = f'''INSERT OR IGNORE INTO student_classes (student_id, class_id)
            VALUES ({studentID}, {classID});'''
            
    cursor.execute(q)
    
    
def addClassSchedule(classID, startTime, endTime, classroom = SCANNER_CLASSROOM):
    q = f'''INSERT INTO class_schedule (class_id, start_time, end_time, classroom)
            VALUES ({classID}, "{startTime}", "{endTime}", "{classroom}");'''
        
    cursor.execute(q)
    
    # Get id from schedule that was made
    classScheduleId = cursor.lastrowid 
        
    # Step 1) Get all members of class
    q = f'''SELECT student_id FROM student_classes 
            WHERE class_id = {classID};'''
    
    members = cursor.execute(q).fetchall() #all student_id's
    
    # Step 2) Set absence to 1
    for member in members:
        student_id = member[0]
        q = f'''INSERT INTO class_schedule_student_absence (class_schedule_id, student_id, absence)
                VALUES ({classScheduleId}, {student_id}, 1);'''
    
# addClassSchedule(1, "2025-04-22 08:00:00", "2025-04-22 10:00:00", "Room 101")

#!-----------------------------------------------------------------------------------
#!---------------------- THINGS THAT MUST BE DONE AUTOMATICALLY ---------------------
#!-----------------------------------------------------------------------------------

def studentEnteredRoom(card_id):
    #Use: SCANNER_CLASSROOM 
    #Current time
    pass


#!-----------------------------------------------------------------------------------
#!-------------------- READ CARD_ID FROM SCANNER THROUGH ARDUINO --------------------
#!-----------------------------------------------------------------------------------
# Read serial port (Information from Arduino)
ser = serial.Serial(COM_PORT, BAUD)

def read_serial():
    if ser.is_open:
        return ser.readline().decode().strip()
    return None

def getOppositeOfPreviousState(id):
    q = f"SELECT checked_in FROM {TABLE_NAME} WHERE card_id = '{id}' ORDER BY time DESC LIMIT 1;"
    res = cursor.execute(q).fetchall()
    
    if len(res) == 0: return True
    return not bool(int(res[0][0]))

# Insert Information to DB
while True:
	ID = read_serial()

	if ID: 
		currentTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
		checkedInState = getOppositeOfPreviousState(ID)
  
		cursor.execute(f"INSERT INTO {TABLE_NAME} (card_id, time, checked_in) VALUES (?, ?, ?)", (ID, currentTime, checkedInState))
		conn.commit()