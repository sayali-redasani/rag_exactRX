import React, { useState, useEffect } from 'react';
import styles from './RandomQueries.module.css'; // You'll need to create this CSS module

const queries = [
    "What is Munich's significance in Germany?",
    "What is the population of Munich as of the latest census?",
    "In which state of Germany is Munich located?",
    "How has Munich’s history shaped its culture and architecture?",
    "What role did Munich play in the rise of the Nazi party?",
    "What are some popular tourist attractions in Munich?",
    "What is the significance of Oktoberfest in Munich?",
    "Which museums in Munich are considered world-class?",
    "What river runs through Munich?",
    "Which mountain range is located near Munich?",
    "What are some of the major industries in Munich today?",
    "Which global companies have their headquarters in Munich?",
    "How has Munich's economy evolved in the 21st century?",   
    "What language is primarily spoken in Munich?",
];



const getRandomQueries = (arr, n) => {
  let shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const RandomQueries = ({ onQuerySelect }) => {
  const [randomQueries, setRandomQueries] = useState([]);

  useEffect(() => {
    setRandomQueries(getRandomQueries(queries, 3));
  }, []);

  return (
<>
    <div
    style={{
      width: "60%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <h1
      style={{ fontSize: "70px", color: "#3B82F6", userSelect: 'none' }}
    >
      {" "}
      ChatBot
    </h1>
  </div>

  <div
    style={{
      marginTop: "30%",
      height: "40%",
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    {randomQueries.map((query, index) => (
      <div className={styles.promptCustom}>
        <p
          key={index}
          onClick={() => {
            onQuerySelect(query);
          }}
          className={styles.subtext}
        >
          {query}
        </p>
      </div>
    ))}
  </div>
</>
  );
};

export default RandomQueries;