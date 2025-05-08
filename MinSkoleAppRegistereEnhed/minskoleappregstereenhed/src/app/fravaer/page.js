"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import styles from "../page.module.css";
import { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";

const data = [
  { name: "Ikke Godkendt", value: 14.75 },
  { name: "Til stede", value: 85.25 },
  { name: "For sent", value: 0 },
  { name: "Godkendt", value: 0 },
];

const COLORS = ["#2C2C2C", "#c3e249", "#8400ae", "#c04229"];

const classNames = [
  {name: "Klasse", value: 78.38},
  {name: "Dansk A, HTX", value: 12.50},
  {name: "Matematik A, HTX", value: 37.50},
  {name: "Teknikfag udvikling og produktion, el A - HTX", value: 0},
  {name: "Erhvervsøkonomi C, VAF", value: 0},
  {name: "Idehistorie B, HTX", value: 0},
  {name: "Informatik B, HTX", value: 0},
]

const sorted = classNames.sort((a, b) => b.value - a.value);


export default function Fravaer() {
  const [visning, setVisning] = useState("graf");

  const [showPicker, setShowPicker] = useState(false);
  const [range, setRange] = useState({ from: undefined, to: undefined });

  const togglePicker = () => setShowPicker(prev => !prev);

  const calculateDays = (from, to) => {
    if (!from || !to) return null;
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inkl. begge dage
    return diffDays;
  };


  return (
    <div className={styles.absencePage}>
      <header className={styles.header}>
        <span>Mit Fravær</span>
      </header>
      <section className={styles.absenceButtonsContainer}>
        <button onClick={() => setVisning("graf")}>
          <div>
            <span class="material-symbols-outlined">pie_chart</span>
          </div>
          <span>
            <i>Grafer</i>
          </span>
        </button>
        <button onClick={() => setVisning("klasser")}>
          <div>
            <span class="material-symbols-outlined">book</span>
          </div>
          <span>
            <i>Klasser</i>
          </span>
        </button>
      </section>
      <main className={styles.absenceMain}>
        <section>
          <div className={styles.absenceHeader}>
            <p>
              <b>Sidste {calculateDays(range.from, range.to)} dage</b>
            </p>
              <div style={{ position: "relative" }}>
                <button className={styles.dateButton} onClick={togglePicker}>
                  {range.from && range.to
                    ? `${range.from.toLocaleDateString("da-DK")} - ${range.to.toLocaleDateString("da-DK")}`
                    : "Vælg datoer"}
                </button>

                {showPicker && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: "-25%",
                    zIndex: 10,
                    background: '#2C2C2C',
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    padding: "10px",
                  }}>
                    <DayPicker
                      mode="range"
                      selected={range}
                      onSelect={setRange}
                      disabled={{ after: new Date() }}
                      onDayClick={() => setShowPicker(false)}
                    />
                  </div>
                )}
              </div>
          </div>
          <div className={styles.absenceInfo}>
            <span>
              <b>Fraværs procent:</b>
            </span>
            <span>{data[0].value}%</span>
          </div>
        </section>
        {visning === "graf" ? (
          <div>
            <section className={styles.form} style={{ height: "275px" }}>
              <ResponsiveContainer
                className={styles.chartContainer}
                width="100%"
                height="100%"
              >
                <PieChart width={400} height={400}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </section>
            <section className={styles.absentInfoTable}>
              <div className={styles.absentInfoCell}>
                <div
                  className={styles.roundDot}
                  style={{ backgroundColor: COLORS[1] }}
                ></div>
                <div className={styles.absentInfoIdentifer}>
                  <span>{data[1].name}</span>
                  <span>
                    <b>{data[1].value}%</b>
                  </span>
                </div>
              </div>
              <div className={styles.absentInfoCell}>
                <div
                  className={styles.roundDot}
                  style={{ backgroundColor: COLORS[2] }}
                ></div>
                <div className={styles.absentInfoIdentifer}>
                  <span>{data[2].name}</span>
                  <span>
                    <b>{data[2].value}%</b>
                  </span>
                </div>
              </div>
              <div className={styles.absentInfoCell}>
                <div
                  className={styles.roundDot}
                  style={{ backgroundColor: COLORS[3] }}
                ></div>
                <div className={styles.absentInfoIdentifer}>
                  <span>{data[3].name}</span>
                  <span>
                    <b>{data[3].value}%</b>
                  </span>
                </div>
              </div>
              <div className={styles.absentInfoCell}>
                <div
                  className={styles.roundDot}
                  style={{ backgroundColor: COLORS[0] }}
                ></div>
                <div className={styles.absentInfoIdentifer}>
                  <span>{data[0].name}</span>
                  <span>
                    <b>{data[0].value}%</b>
                  </span>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div>
            <section>
              <div className={styles.classItem}>
                <span>{sorted[0].name}</span>
                <span>{sorted[0].value}</span>
              </div>
              <div className={styles.classItem}>
                <span>{sorted[1].name}</span>
                <span>{sorted[1].value}</span>
              </div>
              <div className={styles.classItem}>
                <span>{sorted[2].name}</span>
                <span>{sorted[2].value}</span>
              </div>
              <div className={styles.classItem}>
                <span>{sorted[3].name}</span>
                <span>{sorted[3].value}</span>
              </div>
              <div className={styles.classItem}>
                <span>{sorted[4].name}</span>
                <span>{sorted[4].value}</span>
              </div>
              <div className={styles.classItem}>
                <span>{sorted[5].name}</span>
                <span>{sorted[5].value}</span>
              </div>
              <div className={styles.classItem}>
                <span>{sorted[6].name}</span>
                <span>{sorted[6].value}</span>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
