export type GameData = {
    name: string;
    playsOnline: boolean;
}

export type PlayerData = {
    // Only used for counting matches. Not connected with ID in database
    matchId: number;

    username: string;
    displayName: string;
    age?: number;
    city?: string;
    description: string;
    avatarPath?: string;
    games: GameData[];
}

type RequiredFieldsForMatching = {
    [key: string]: boolean;
    birthday: boolean;
    displayName: boolean;
    avatar: boolean;
    profileDescription: boolean;
    contactInfo: boolean;
    city: boolean;
    games: boolean;
};

export type UserMatchingValidationResult = {
    isValid: boolean;
    missingFields: RequiredFieldsForMatching;
}