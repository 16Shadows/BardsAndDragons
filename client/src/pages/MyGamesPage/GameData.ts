type GameData = {
    id: number;
    gamename: string;
    description: string;
    playerCount: string;
    ageRating: string;
    image?: string;
    tags? : string[];
    playsOnline: boolean;
};

export default GameData;