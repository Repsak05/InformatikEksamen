import sqlite3
import serial
from datetime import datetime

# Initital setup
DB_NAME = "somename.db"
TABLE_NAME = "arrivals"
COM_PORT = 'COM10'
BAUD = 9600

conn = sqlite3.connect(DB_NAME)
cursor = conn.cursor()

# Create table if not alredy made
cursor.execute(f'''CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    card_id TEXT, 
                    time DATETIME,
                    checked_in BOOL)''')

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