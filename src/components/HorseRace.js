import React, { useState, useEffect } from 'react';
import './HorseRace.css';

const HorseRace = () => {
  const [numHorses, setNumHorses] = useState();
  const [horses, setHorses] = useState([]);
  const [finishOrder, setFinishOrder] = useState([]);
  const [boosterPosition, setBoosterPosition] = useState(-1);
  const [isRaceStarted, setIsRaceStarted] = useState(false);

  const startRace = () => {
    fetch(`http://localhost:8080/race/start?numHorses=${numHorses}`, { method: 'POST' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return fetch('http://localhost:8080/race/horses');
      })
      .then(response => response.json())
      .then(data => {
        setHorses(data);
        setIsRaceStarted(true);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  };

  useEffect(() => {
    let intervalId;
    if (isRaceStarted) {
      console.log('Starting interval to fetch race state');
      intervalId = setInterval(() => {
        fetch('http://localhost:8080/race/state')
          .then(response => response.json())
          .then(data => {
            setHorses(data.horses);
            setFinishOrder(data.finishOrder);
            setBoosterPosition(data.boosterPosition);
            if (data.finishOrder.length >= 3) {
              clearInterval(intervalId);
              setIsRaceStarted(false);
            }
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
          });
      }, 1000);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [isRaceStarted]);

  return (
    <div className="container">
      <div className="controls">
        <label>
          Número de Caballos:
          <input
            type="number"
            value={numHorses}
            onChange={(e) => setNumHorses(Number(e.target.value))}
          />
        </label>
        <button onClick={startRace}>Comenzar Carrera</button>
      </div>
      <div className="info-sections">
        <div className="participants">
          <h2>Caballos Participantes</h2>
          {horses.map((horse, index) => (
            <div key={index}>
              {horse.name} - Velocidad: {horse.speed}, Resistencia: {horse.endurance}
            </div>
          ))}
        </div>
        <div className="distances">
          <h2>Distancias Recorridas</h2>
          {horses.map((horse, index) => (
            <div key={index}>
              {horse.name}: {horse.distanceCovered} metros
            </div>
          ))}
        </div>
      </div>
      <div className="race-track">
        {horses.map((horse, index) => (
          <div
            key={index}
            className="horse"
            style={{ left: `${(horse.distanceCovered / 10)}%` }}
          >
            {horse.name}: {horse.distanceCovered} metros
          </div>
        ))}
        <div
          className="booster"
          style={{ left: `${(boosterPosition / 10)}%` }}
        >
          Area Potenciadora
        </div>
      </div>
      <div className="finish-order">
        <h2>Carrera terminada, orden de llegada</h2>
        {finishOrder.map((name, index) => (
          <div key={index}>
            {index + 1}. {name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorseRace;
