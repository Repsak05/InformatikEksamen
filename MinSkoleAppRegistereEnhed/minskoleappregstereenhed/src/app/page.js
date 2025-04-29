"use client";


import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
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
          <form action="" className={styles.formContent}>
            <input name="Brugernavn" placeholder="Brugernavn" type="username" />
            <input name="Adgangskode" placeholder="Adgangskode" type="password"/>
            <button type="button" onClick={læsFraSerielPort}>Tilføj Enhed</button>
          </form>
        </div>
      </main>
    </div>
  );
}

async function læsFraSerielPort() {
  let port, reader;

  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });

    const decoder = new TextDecoderStream();
    const inputDone = port.readable.pipeTo(decoder.writable);
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
        const sidste8 = linje.slice(-8); // <- her
        console.log("Modtaget UID:", linje);
        console.log("Sidste 8 tegn:", sidste8);
        break;
      }
    }

    await reader.cancel();
    await inputDone;
    reader.releaseLock();
    await port.close();
  } catch (err) {
    console.error("Fejl ved læsning fra seriel port:", err);
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
}