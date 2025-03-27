 
#include <SPI.h>
#include <MFRC522.h>
 
#define SS_PIN 10
#define RST_PIN 9
MFRC522 mfrc522(SS_PIN, RST_PIN);   // Create MFRC522 instance.

const int buzzer = 8; //buzzer to arduino pin 9
 
void setup() 
{
  Serial.begin(9600);   // Initiate a serial communication
  SPI.begin();          // Initiate  SPI bus
  mfrc522.PCD_Init();   // Initiate MFRC522
  // Serial.println("Approximate your card to the reader...");
  // Serial.println(2);
  pinMode(buzzer, OUTPUT);
}
void loop() 
{
  String ID = getId();
  if(ID.length()){
    Serial.println(ID);

    //Set buzzer active (Might want to get signal from .py to ensure that it worked)
    tone(buzzer, 1000); // Send 1KHz sound signal...
    delay(500);         // ...for 1 sec
    noTone(buzzer);     // Stop sound...
    delay(2000);         
  }
} 

String getId()
{
   // Look for new cards
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return "";
  }

  // Select one of the cards
  if ( ! mfrc522.PICC_ReadCardSerial()){
    return "";
  }

  //Show UID on serial monitor
  String content= "";
  byte letter;
  for (byte i = 0; i < mfrc522.uid.size; i++) 
  {
    content.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " "));
    content.concat(String(mfrc522.uid.uidByte[i], HEX));
  }
  content.toUpperCase();
  return content;
}


