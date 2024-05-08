import React from "react";
import { useState } from "react";

export interface IGameProps {
    id: number;
    name: string;
    description: string;
    playerCount: string;
    ageRating: string; 
}

interface IProps {
    game: IGameProps;
}

//const Game = ({id, name, description, playerCount, ageRating}: GameProps) => {
const Game = ({game}: IProps) => {
    return (
        <div style={{marginTop: "300px", marginBottom: "10px"}}>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", backgroundColor: "white", borderRadius: "7px" }}>
                <div style={{ width: "20%", margin: "3px 3px 3px 5px"}}>
                    <p style={{ wordBreak: "break-all" }}>Здесь будет картинка</p>
                </div>
                <div style={{ width: "80%", margin: "3px 5px 3px 10px"}}>
                    <div><strong>{game.id}</strong></div>
                    <div>Описание: {game.description}</div>
                    <div>Кол-во игроков: {game.playerCount}</div>
                    <div>Возраст: {game.ageRating}</div>
                </div>
            </div>
        </div>
    )
}

export default Game;