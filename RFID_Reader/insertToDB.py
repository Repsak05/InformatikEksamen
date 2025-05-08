import sqlite3
import serial
from datetime import datetime

# Initital setup
DB_NAME = "somename.db"
TABLE_NAME = "arrivals" #<-- OLD

COM_PORT = 'COM10'
BAUD = 9600

SCANNER_CLASSROOM = "D2354"
EXAMPLE_STUDENT_CARD_ID ="69A164A3"

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

def getStudentIdFromCard(card_id):
    q = f'''SELECT student_id FROM STUDENTS
           WHERE card_id = "{card_id}"
           ORDER BY student_id ASC LIMIT 1;'''
    
    res = cursor.execute(q).fetchall()
    if not res:
        print("NO STUDENT_ID WAS FOUND")
        return
    
    return res[0][0]
    
#!-----------------------------------------------------------------------------------
#!------------------------ THINGS THAT MUST BE DONE MANUALLY ------------------------
#!-----------------------------------------------------------------------------------

def addSchool(name): #Issue: Can be multiple with same name
    q = f'''INSERT INTO schools (name)
        VALUES ("{name}");'''
        
    cursor.execute(q)
    print(q)
    conn.commit()   

def addTeacher(name):
    q = f'''INSERT INTO teachers (name)
            VALUES ("{name}");'''
    
    cursor.execute(q)
    print(q)
    conn.commit()

# addTeacher("aejif")

def addStudent(name, cardID): #Should card_id be the unique identifier? - what if card changes...
    q = f'''INSERT INTO students (name, card_id)
            VALUES ("{name}", "{cardID}");'''
    
    cursor.execute(q)
    print(q)
    conn.commit()

# addStudent("student1", "69 A1 64 A3")

def addClass(name, schoolID = 1):
    q = f'''INSERT INTO classes (name, school_id)
            VALUES ("{name}", {schoolID});'''
    
    cursor.execute(q)
    print(q)
    conn.commit()

# addClass("Matematik", 1)

def addStudentToClass(studentID, classID):
    q = f'''INSERT OR IGNORE INTO student_classes (student_id, class_id)
            VALUES ({studentID}, {classID});'''
            
    cursor.execute(q)
    print(q)
    conn.commit()
    
# addStudentToClass(2, 3)
    
def addClassSchedule(classID, startTime, endTime, classroom = SCANNER_CLASSROOM):
    q = f'''INSERT INTO class_schedule (class_id, start_time, end_time, classroom)
            VALUES ({classID}, "{startTime}", "{endTime}", "{classroom}");'''
        
    cursor.execute(q)
    print(q)
    conn.commit()
    
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
        
        cursor.execute(q)
        print(q)
        conn.commit()
          
# addClassSchedule(2, "2025-04-23 12:00:00", "2025-06-22 10:00:00", SCANNER_CLASSROOM)
# addClassSchedule(1, "2025-05-01 15:00:00", "2025-06-22 10:00:00", SCANNER_CLASSROOM)

#!-----------------------------------------------------------------------------------
#!---------------------- THINGS THAT MUST BE DONE AUTOMATICALLY ---------------------
#!-----------------------------------------------------------------------------------

def studentEnteredRoom(card_id, classroom = SCANNER_CLASSROOM): #maybe join tables instead
    q = f'''SELECT student_id FROM STUDENTS
           WHERE card_id = "{card_id}"
           ORDER BY student_id ASC LIMIT 1;'''
    
    res =  cursor.execute(q).fetchall()
    if not res:
        print("NO STUDENT_ID WAS FOUND")
        return
    
    studentID = res[0][0]
    # print(studentID) 
    
    # Find classes in this classroom
    currentTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    q = f'''SELECT class_schedule_id, class_id FROM class_schedule
            WHERE classroom = "{classroom}"
            AND start_time <= "{currentTime}"
            AND end_time > "{currentTime}";'''
    
    
    ongoingSchedulesInClassroom = cursor.execute(q).fetchall() # res is all [(class_schedule_id, class_id)...]
    # print(ongoingSchedulesInClassroom)
    
    # Set you classes in that classroom absence = 0  
    for [class_shedule_id, class_id] in ongoingSchedulesInClassroom:
        # print(class_shedule_id, class_id)
        
        q = f'''SELECT student_id FROM student_classes
                WHERE class_id = "{class_id}"
                AND student_id = {studentID}'''
        
        ans = cursor.execute(q).fetchall()
        
        q = f'''SELECT absence FROM class_schedule_student_absence
                WHERE class_schedule_id = "{class_shedule_id}"
                AND student_id = {studentID};'''
        

        absen = cursor.execute(q).fetchall()
        if(len(ans) and len(absen)):
            
            SET_OPPOSITE_ABSENCE = 1 - absen[0][0] #absen always 0?
            # print("Now: ", SET_OPPOSITE_ABSENCE, " --> ", class_shedule_id, studentID)
            
            q = f'''UPDATE class_schedule_student_absence
                    SET absence = {SET_OPPOSITE_ABSENCE}
                    WHERE class_schedule_id = {class_shedule_id}'''
            
            cursor.execute(q)
            conn.commit()
            print("UPDATED class: ", class_id)
    
# studentEnteredRoom(EXAMPLE_STUDENT_CARD_ID)
#!-----------------------------------------------------------------------------------
#!-------------------------- GET STATICS ABOUT YOUR ABSENCE -------------------------
#!-----------------------------------------------------------------------------------

def studentAbsence(card_id, subjectID = 0):
    # studentID = getStudentIdFromCard(card_id)
    studentID = 2
    currentTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    def getResponse(getAbsence = 1, subjectID = 0):
        q = f'''SELECT count(*) FROM student_classes
            JOIN class_schedule ON student_classes.class_id = class_schedule.class_id
            JOIN class_schedule_student_absence ON student_classes.student_id = class_schedule_student_absence.student_id
            WHERE student_classes.student_id = {studentID}
            AND class_schedule.start_time <= "{currentTime}"
            AND class_schedule_student_absence.absence = {getAbsence}'''
    
        if subjectID > 0: q += f''' AND class_schedule.class_id = {subjectID}'''
        
        res = cursor.execute(q).fetchall()
        if(len(res)): return res[0][0]
        return 0
    
    
    absent = getResponse(1, subjectID)
    present = getResponse(0, subjectID)
    
    if absent + present == 0: return 0
    return int((absent / (absent + present)) * 100)

def getAllSubjectAbsence(card_id):
    studentID = getStudentIdFromCard(card_id)
    # studentID = 2
    
    q = f'''SELECT classes.class_id, classes.name FROM classes
            JOIN student_classes ON classes.class_id = student_classes.class_id
            WHERE student_classes.student_id = {studentID}'''
    
    allClassIDs = cursor.execute(q).fetchall()
    results = []
    for classID, name in allClassIDs:
        absenceRate = studentAbsence(card_id, classID)
        results.append({"name" : name, "value" : absenceRate})
        
    print(results)

# getAllSubjectAbsence("69 A1 64 A3")
# print(studentAbsence(0, 0))

def getStats(card_id):
    studentID = getStudentIdFromCard(card_id)
    if not studentID: return

    q = f'''SELECT absence, class_schedule_id FROM class_schedule_student_absence
            WHERE student_id = {studentID};'''
    
    absenceStates = cursor.execute(q).fetchall()
    # print(absenceStates)  
    
    #VERIFY THAT THE SCHEDULE IS COMPLETE
    classesAbsence = {}
    
    amountOfZero = 0
    amountOfOne = 0
    
    for [state, class_schedule_id] in absenceStates: #?maybe MERGE db instead - studen -> class_schedule_absence?
        q = f'''SELECT class_id, start_time FROM class_schedule
                WHERE class_schedule_id = {class_schedule_id}'''
        
        currentTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        [class_id, startTime] = cursor.execute(q).fetchall()[0]
        
        if startTime <= currentTime:
            if state == 0: amountOfZero += 1
            if state == 1: amountOfOne += 1
            
            # Get classname:
            q = f'''SELECT name FROM classes
                    WHERE class_id = {class_id}'''
            
            name = cursor.execute(q).fetchall()[0][0]            
            statename = "participated" if state == 1 else "absence"
            if name not in classesAbsence: classesAbsence[name] = {}
            if statename not in classesAbsence[name]: classesAbsence[name][statename] = 0
            classesAbsence[name][statename] += 1
    
    print(classesAbsence)
    
    # percent = 0
    # if amountOfOne + amountOfZero > 0: percent = round(amountOfZero / (amountOfOne + amountOfZero) * 100)
    # print({"Absence: " : amountOfZero, " | Participated: " : amountOfOne, " | Percentage absence: " : str(percent) +  "%" })
        

# getStats(EXAMPLE_STUDENT_CARD_ID)

#!-----------------------------------------------------------------------------------
#!-------------------- READ CARD_ID FROM SCANNER THROUGH ARDUINO --------------------
#!-----------------------------------------------------------------------------------
# Read serial port (Information from Arduino)
# ser = serial.Serial(COM_PORT, BAUD)

# def read_serial():
#     if ser.is_open:
#         return ser.readline().decode().strip()
#     return None


# while True:
#     STUDENT_ID = read_serial()
    
#     if STUDENT_ID:
#         studentEnteredRoom(STUDENT_ID, SCANNER_CLASSROOM)







# def getOppositeOfPreviousState(id):
#     q = f"SELECT checked_in FROM {TABLE_NAME} WHERE card_id = '{id}' ORDER BY time DESC LIMIT 1;"
#     res = cursor.execute(q).fetchall()
    
#     if len(res) == 0: return True
#     return not bool(int(res[0][0]))

# # Insert Information to DB
# while True:
# 	ID = read_serial()

# 	if ID: 
# 		currentTime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
# 		checkedInState = getOppositeOfPreviousState(ID)
  
# 		cursor.execute(f"INSERT INTO {TABLE_NAME} (card_id, time, checked_in) VALUES (?, ?, ?)", (ID, currentTime, checkedInState))
# 		conn.commit()