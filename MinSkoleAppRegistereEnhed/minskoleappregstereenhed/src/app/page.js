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
            <button type="submit">Tilføj Enhed</button>
          </form>
        </div>
      </main>
    </div>
  );
}
