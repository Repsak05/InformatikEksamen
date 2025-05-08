"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import styles from "../page.module.css";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";

const COLORS = ["#2C2C2C", "#c3e249", "#8400ae", "#c04229"];

export default function Fravaer() {
  const [absence, setAbsence] = useState({ total: [], allAbsences: [] });
  const [visning, setVisning] = useState("graf");
  const [showPicker, setShowPicker] = useState(false);
  const [range, setRange] = useState({ from: undefined, to: undefined });

  const EXAMPLE_CARD_ID = "69 A1 64 A3";

  useEffect(() => {
    fetch(`/api/getAbsence?card_id=${EXAMPLE_CARD_ID}`)
      .then(res => res.json())
      .then(json => setAbsence(json))
      .catch(err => console.error('Error fetching absence data:', err));
  }, []);

  console.log(absence);

  const togglePicker = () => setShowPicker(prev => !prev);

  const calculateDays = (from, to) => {
    if (!from || !to) return null;
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const sorted = [...absence.allAbsences].sort((a, b) => b.value - a.value);


  console.log("Range:", range.from, range.to);
  return (
    <div className={styles.absencePage}>
      <header className={styles.header}>
        <span>Mit Fravær</span>
      </header>
      <section className={styles.absenceButtonsContainer}>
        <button onClick={() => setVisning("graf")}>
          <div>
            <span className="material-symbols-outlined">pie_chart</span>
          </div>
          <span>
            <i>Grafer</i>
          </span>
        </button>
        <button onClick={() => setVisning("klasser")}>
          <div>
            <span className="material-symbols-outlined">book</span>
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
                      captionLayout="dropdown"
                      selected={range}
                      onSelect={setRange}
                      disabled={{ after: new Date() }}
                    />
                  </div>
                )}
              </div>
          </div>
          <div className={styles.absenceInfo}>
            <span>
              <b>Fraværs procent:</b>
            </span>
            <span>{absence.total[0]?.value ?? 0}%</span>
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
                    data={absence.total}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {absence.total.map((entry, index) => (
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
              {absence.total.map((item, index) => (
                <div key={index} className={styles.absentInfoCell}>
                  <div
                    className={styles.roundDot}
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className={styles.absentInfoIdentifer}>
                    <span>{item.name}</span>
                    <span>
                      <b>{item.value}%</b>
                    </span>
                  </div>
                </div>
              ))}
            </section>
          </div>
        ) : (
          <div>
            <section>
              {sorted.map((cls, index) => (
                <div key={index} className={styles.classItem}>
                  <span>{cls.name}</span>
                  <span>{cls.value}%</span>
                </div>
              ))}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
