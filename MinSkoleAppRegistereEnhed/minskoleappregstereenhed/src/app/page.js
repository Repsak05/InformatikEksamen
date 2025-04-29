"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const [rfid, setRfid] = useState(null);

  const læsFraSerielPort = async () => {
    console.log("læsFraSerielPort function started");
    
    if (!("serial" in navigator)) {
      console.log("Web Serial API not supported");
      alert("Denne browser understøtter ikke Web Serial API.");
      return;
    }

    let port, reader;
    try {
      console.log("Requesting serial port...");
      port = await navigator.serial.requestPort();
      console.log("Serial port requested");
      
      await port.open({ baudRate: 9600 });
      console.log("Port opened");

      const decoder = new TextDecoderStream();
      const inputDone = port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      reader = inputStream.getReader();

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += value;
        console.log("Buffer:", buffer);

        const newlineIndex = buffer.indexOf("\n");
        if (newlineIndex !== -1) {
          const linje = buffer.slice(0, newlineIndex).trim();
          console.log("Modtaget UID:", linje);
          console.log("Sidste 8 tegn:", linje.slice(-8));
          
          const sidste8 = linje.slice(-8);
          console.log("Setting RFID state:", sidste8);
          setRfid(sidste8);
          break;
        }
      }
    } catch (err) {
      console.error("Error in læsFraSerielPort:", err);
      alert("Uventet fejl – se konsollen.");
    } finally {
      if (reader) {
        try {
          await reader.cancel();
          reader.releaseLock();
        } catch (_) {}
      }
      if (port && port.readable) {
        try {
          await port.close();
        } catch (_) {}
      }
    }
  };

  const sendRfidToDatabase = async () => {
    console.log("sendRfidToDatabase function started");
    if (!rfid) {
      console.log("No RFID value to send");
      return;
    }
    
    try {
      console.log("Sending RFID to database:", rfid);
      const response = await fetch("api/saveRfid.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rfid }),
      });
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Received data:", data);
      
      if (data.error) {
        console.error("Error received from server:", data.error);
        alert("Error: " + data.error);
      } else {
        console.log("RFID saved successfully");
        alert("RFID saved successfully!");
      }
    } catch (error) {
      console.error("Error sending RFID to database:", error);
      alert("Error saving RFID");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span>Tilføj Enhed</span>
      </header>
      <main className={styles.main}>
        <div className={styles.form}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/14/AARHUS_TECH_logo.svg"
            alt="Aarhus Tech Logo"
            className={styles.formImage}
          />
          <form action="post" className={styles.formContent}>
            <input name="Brugernavn" placeholder="Brugernavn" type="username" />
            <input name="Adgangskode" placeholder="Adgangskode" type="password" />

            {rfid ? (
              <input
                name="RFID"
                value={rfid}
                placeholder="RFID"
                type="text"
                readOnly
                className={styles.rfidInput}
              />
            ) : (
              <button type="button" onClick={læsFraSerielPort}>
                Tilføj Enhed
              </button>
            )}
            <button type="button" onClick={sendRfidToDatabase}>
              Registerer
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}