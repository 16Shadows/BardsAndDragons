import './GameItem.css';
import { Link } from 'react-router-dom';
import NoImageAvailable from '../../resources/Uno flip.jpg';
import GameData from './GameData';
import { getGamePageRoute } from '../../components/routes/Navigation';
import { PropsWithChildren, useState } from 'react';

export type GameItemProps = {
    game: GameData;
};

function GameItem(props: PropsWithChildren<GameItemProps>) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleExpandClick = () => {
        setIsExpanded(!isExpanded);
    };

    // return (
    //     <div className="game-item align-items-center p-2 mb-2">
    //         {/* Картинка игры */}
    //         <div className="game-icon">
    //             <img width={"100%"} height={"100%"} src={props.game.images ?? NoImageAvailable } alt='Avatar' />
    //         </div>

    //         {/* Описание игры */}
    //         <div className="game-describe">
    //             <div>
    //                 {/* Переход к игре */}
    //                 <Link to={getGamePageRoute(props.game.gamename)} className='me-auto h-auto text-wrap'>
    //                     {props.game.gamename}
    //                 </Link>
    //             </div>
    //             <div>{props.game.description}</div>
    //             <div style={{ fontWeight: "bolder" }}>{props.game.playerCount} игроков, {props.game.ageRating}</div>
    //         </div>
    //         {props.children}
    //     </div>
    // );

    return (
        <div className={`game-item ${isExpanded ? 'expanded' : ''}`}>
            <div className="game-icon">
                <img src={props.game.images ? props.game.images[0] : NoImageAvailable} alt='Game Avatar' />
            </div>

            <div className="game-describe">
                <div className="game-header">
                    <Link to={getGamePageRoute(props.game.gamename)} className='game-title h-auto text-wrap'>
                        {props.game.gamename}
                    </Link>
                    <div className="game-buttons">
                        {props.children}
                    </div>
                    <button className="expand-button" onClick={handleExpandClick}>
                        {isExpanded ? '▲' : '▼'}
                    </button>
                </div>
                <div className="game-description">
                    {props.game.description}
                </div>
                <div className="game-details">
                    <div>{props.game.playerCount} игроков, {props.game.ageRating}</div>
                    <div className="game-tags">
                        {props.game.tags?.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameItem;