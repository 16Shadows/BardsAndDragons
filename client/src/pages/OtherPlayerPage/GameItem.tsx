import './GameItem.css';
import { Link } from 'react-router-dom';
import NoImageAvailable from '../../resources/Uno flip.jpg';
import GameData from './GameData';
import { getGamePageRoute } from '../../components/routes/Navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

export type GameItemProps = {
    game: GameData;
};

function GameItem(props: PropsWithChildren<GameItemProps>) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [visibleTags, setVisibleTags] = useState<string[]>([]);
    const [hiddenTagsCount, setHiddenTagsCount] = useState(0);

    useEffect(() => {
        if (isExpanded) {
            setVisibleTags(props.game.tags || []);
            setHiddenTagsCount(0);
        } else {
            const tags = props.game.tags || [];
            setVisibleTags(tags.length ? tags.slice(0, 3) : ["Нет тегов"]); // Provide default if no tags
            setHiddenTagsCount(Math.max(tags.length - 3, 0)); // Calculate hidden tags count
        }
    }, [isExpanded, props.game.tags]);

    const handleExpandClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`game-item ${isExpanded ? 'expanded' : ''}`}>
            <div className="game-icon">
                <img src={props.game.image ? props.game.image : NoImageAvailable} alt='Game Avatar' />
            </div>

            <div className="game-describe">
                <div className="game-header">
                    <Link to={getGamePageRoute(String(props.game.id))} className='game-title h-auto text-wrap'>
                        {props.game.gamename}
                    </Link>

                    <div className="online-status">
                        <span>Играю онлайн</span>
                        <input type="checkbox" checked={props.game.playsOnline} disabled className="styled-checkbox" />
                    </div>

                    <button className="expand-button" onClick={handleExpandClick}>
                        {isExpanded ? '▲' : '▼'}
                    </button>

                </div>
                <div className="game-description-container">
                    <div className="game-description">
                        {props.game.description}
                    </div>
                </div>

                <div className="game-details">
                    <div>{props.game.playerCount} игроков, {props.game.ageRating}</div>
                    <div className="game-tags-container">
                        {visibleTags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                        {hiddenTagsCount > 0 && !isExpanded && (
                            <span className="tag-indicator">Ещё {hiddenTagsCount}+</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameItem;