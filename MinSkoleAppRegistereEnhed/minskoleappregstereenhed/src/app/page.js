"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [rfid, setRfid] = useState(null);
  const [brugernavn, setBrugernavn] = useState("");

  const læsFraSerielPort = async () => {
    if (!("serial" in navigator)) {
      alert("Denne browser understøtter ikke Web Serial API.");
      return;
    }
  
    let port, reader, inputDone;
    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
  
      const decoder = new TextDecoderStream();
      inputDone = port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      reader = inputStream.getReader();
  
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
  
        buffer += value;
        const newlineIndex = buffer.indexOf("\n");
        if (newlineIndex !== -1) {
          const linje = buffer.slice(0, newlineIndex).trim();
          setRfid(linje.slice(-8));
          break;
        }
      }
    } catch (err) {
      console.error("Fejl ved læsning:", err);
      alert("Fejl under læsning – se konsollen.");
    } finally {
      try {
        if (reader) {
          await reader.cancel();
          reader.releaseLock();
        }
        if (inputDone) await inputDone;
        if (port) await port.close();
      } catch (err) {
        console.warn("Fejl ved lukning:", err);
      }
    }
  };
  
  const handleSubmit = async () => {
    fetch('/api/addstudent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfid, name: brugernavn }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) alert("Registreret!");
      else alert("Fejl: " + data.error);
    });
  }

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
          <form className={styles.formContent} onSubmit={(e) => e.preventDefault()}>
            <input
              name="Brugernavn"
              placeholder="Brugernavn"
              type="text"
              value={brugernavn}
              onChange={(e) => setBrugernavn(e.target.value)}
            />
            {rfid ? (
              <input name="RFID" value={rfid} readOnly className={styles.rfidInput} />
            ) : (
              <button type="button" onClick={læsFraSerielPort}>
                Læs RFID
              </button>
            )}
            <button type="button" onClick={handleSubmit}>
              Registrér
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
