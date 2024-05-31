import {injectable} from "tsyringe";
import {ModelDataSource} from "../model/dataSource";
import {User} from "../model/user";
import {UsersGame} from "../model/usersGame";
import {UsersFriend} from "../model/usersFriend";
import {RejectedMatch} from "../model/rejectedMatch";
import {SelectQueryBuilder} from "typeorm";

type GameData = {
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

@injectable()
export class MatchingService {
    // Points for calculating the score for each potential player
    // Points if the city is the same as the current user
    private pointsForSameCity = 30;
    // Points if the age is the same as the current user. Otherwise, from this number will be subtracted the age difference
    private pointsForSameAge = 10;
    // Points for each common game
    private pointsForSameGame = 100;
    // Points for each common friend
    private pointsForSameFriend = 20;

    protected readonly _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    /**
     * Gets ranked players with player data for matching.
     */
    async getRankedPlayersForMatching(currentUser: User, limit: number): Promise<PlayerData[]> {
        const matchingCandidatesQuery = this.getMatchingCandidatesQuery(currentUser.id);
        const rankedPlayersQuery = this.getRankedPlayersQuery(matchingCandidatesQuery, currentUser.id, limit);
        return await rankedPlayersQuery.getRawMany<PlayerData>();
    }

    /**
     * Checks if a user with the given ID meets the matching criteria.
     */
    async isUserValidForMatching(userId: number): Promise<boolean> {
        const repo = this._dbContext.getRepository(User);
        const qb = repo
            .createQueryBuilder("user")
            .where("user.id = :userId", {userId});

        this.applyMatchingCriteria(qb);

        const user = await qb.getOne();
        return !!user;
    }

    /**
     * Returns a query builder for the list of users who are allowed to participate in matching for the current user.
     * Chooses players with required data. Excludes friends and rejected matches.
     */
    private getMatchingCandidatesQuery(currentUserId: number): SelectQueryBuilder<User> {
        const repo = this._dbContext.getRepository(User);
        const qb = repo
            .createQueryBuilder("user")

            // Select only user id
            .select("user.id", "id")
            .distinct(true)

            // Exclude the current user
            .where("user.id != currentUser.id")

            // Set the current user
            .addFrom(User, "currentUser")
            .andWhere("currentUser.id = :currentUserId", {currentUserId});

        this.applyMatchingCriteria(qb);

        return qb
            // Exclude users who are already friends with the current user
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select("usersFriend.friendId")
                    .from(UsersFriend, "usersFriend")
                    .where("usersFriend.userId = currentUser.id")
                    .andWhere("usersFriend.friendId = user.id")
                    .getQuery();
                return `NOT EXISTS ${subQuery}`;
            })

            // Exclude users who have been rejected by or have rejected the current user
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select("rejectedMatch.receiverId")
                    .from(RejectedMatch, "rejectedMatch")
                    .where("(rejectedMatch.initiatorId = currentUser.id AND rejectedMatch.receiverId = user.id) " +
                        "OR (rejectedMatch.initiatorId = user.id AND rejectedMatch.receiverId = currentUser.id)")
                    .getQuery();
                return `NOT EXISTS ${subQuery}`;
            })
    }

    /**
     * Applies the criteria for users to participate in matching.
     */
    private applyMatchingCriteria(qb: SelectQueryBuilder<User>): SelectQueryBuilder<User> {
        return qb
            .andWhere("user.isDeleted = false") // only active users

            .andWhere("user.birthday IS NOT NULL") // only users with a birthday
            .andWhere("user.displayName IS NOT NULL AND user.displayName != ''") // only users with a display name
            .andWhere("user.avatarId IS NOT NULL") // only users with an avatar
            .andWhere("user.profileDescription IS NOT NULL AND user.profileDescription != ''") // only users with a profile description
            .andWhere("user.contactInfo IS NOT NULL AND user.contactInfo != ''") // only users with a contact info
            .andWhere("user.cityId IS NOT NULL") // only users with a city

            // Only users with at least one game
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select("usersGame.userId")
                    .from(UsersGame, "usersGame")
                    .where("usersGame.userId = user.id")
                    .getQuery();
                return `EXISTS ${subQuery}`;
            });
    }

    // TODO: add a selection of players according to the parameters:
    //  5. The more game tags match, the higher the score
    //  6. Mix a random number?
    /**
     * Returns a query builder for the list of ranked players for matching for the current user.
     *
     * Rank is based on:
     * 1. Same cities
     * 2. Smaller the age difference, the higher the score
     * 3. More common games, the higher the score
     * 4. More common friends, the higher the score
     */
    private getRankedPlayersQuery(matchingCandidatesQuery: SelectQueryBuilder<User>, currentUserId: number, limit: number): SelectQueryBuilder<User> {
        const repo = this._dbContext.getRepository(User);

        // Add selection for city and age scores
        this.addCityScoreSelection(matchingCandidatesQuery);
        this.addAgeScoreSelection(matchingCandidatesQuery);

        const query = repo
            .createQueryBuilder("user")
            // Number the rows according to the total score in descending order
            .select(`
                ROW_NUMBER() OVER (ORDER BY 
                    COALESCE("matchingCandidates"."cityScore", 0) +
                    COALESCE("matchingCandidates"."ageScore", 0) +
                    COALESCE("gameScoreSubquery"."gameScore", 0) +
                    COALESCE("friendScoreSubquery"."friendScore", 0)
                        DESC)`, "matchId")
            .innerJoin(`(${matchingCandidatesQuery.getQuery()})`, "matchingCandidates", `"matchingCandidates"."id" = "user"."id"`);

        // Add subqueries for game and friend scores
        const gameScoreSubquery = this.getGameScoreSubquery(query, currentUserId);
        const friendScoreSubquery = this.getFriendScoreSubquery(query, currentUserId);

        this.selectPlayerData(query, currentUserId);

        return query
            .leftJoin(`(${gameScoreSubquery.getQuery()})`, "gameScoreSubquery", `"gameScoreSubquery"."userId" = "user"."id"`)
            .leftJoin(`(${friendScoreSubquery.getQuery()})`, "friendScoreSubquery", `"friendScoreSubquery"."userId" = "user"."id"`)
            .limit(limit)
            // Set parameters for calculation of scores
            .setParameter("pointsForSameCity", this.pointsForSameCity)
            .setParameter("pointsForSameAge", this.pointsForSameAge)
    }

    /**
     * Adds the player data to the query builder.
     */
    private selectPlayerData(qb: SelectQueryBuilder<User>, currentUserId: number): SelectQueryBuilder<User> {
        return qb
            .leftJoin('user.games', 'usersGame')
            .leftJoin('usersGame.game', 'game')
            .leftJoin('user.city', 'city')
            .leftJoin('user.avatar', 'avatar')

            .addSelect([
                'user.username AS "username"',
                'user.displayName AS "displayName"',
                // When it isn't allowed to show age, the age is null
                `CASE WHEN user.canDisplayAge = true THEN EXTRACT(YEAR FROM AGE(user.birthday)) ELSE NULL END AS "age"`,
                'city.name AS "city"',
                'user.profileDescription AS "description"',
                'avatar.blob AS "avatarPath"'
            ])

            // Show first games that are the same as the current user, then others
            .addSelect(`json_agg(json_build_object('name', game.name, 'playsOnline', usersGame.playsOnline)
                ORDER BY CASE WHEN usersGame.gameId IN (SELECT users_game."gameId" FROM users_game WHERE users_game."userId" = :currentUserId) THEN 0 ELSE 1 END)`, 'games')
            .groupBy('user.id, avatar.blob, city.name, "matchingCandidates"."cityScore", "matchingCandidates"."ageScore", "gameScoreSubquery"."gameScore", "friendScoreSubquery"."friendScore"')
            .setParameter("currentUserId", currentUserId)
    }

    /**
     * Calculates the score for the same city as the current user. If cities are the same, user gets constant points.
     */
    private addCityScoreSelection(qb: SelectQueryBuilder<User>) {
        qb
            .addSelect(`CASE WHEN "user"."cityId" = "currentUser"."cityId" THEN :pointsForSameCity ELSE 0 END`, "cityScore")
    }

    /**
     * Calculates the score for the same age as the current user. The bigger the difference, the fewer points will be given to the user.
     */
    private addAgeScoreSelection(qb: SelectQueryBuilder<User>) {
        qb
            .addSelect(
                `:pointsForSameAge - ABS(EXTRACT(YEAR FROM "user"."birthday") - EXTRACT(YEAR FROM "currentUser"."birthday"))`,
                "ageScore")
    }

    /**
     * Calculates the score for the same games as the current user. For each same game, user gets constant points.
     */
    private getGameScoreSubquery(qb: SelectQueryBuilder<User>, currentUserId: number) {
        return qb
            .subQuery()
            .select("ug1.userId", "userId")
            .addSelect("COUNT(*) * :pointsForSameGame", "gameScore")
            .from(UsersGame, "ug1")
            .innerJoin(UsersGame, "ug2", "ug1.gameId = ug2.gameId")
            .where("ug2.userId = :currentUserId", {currentUserId})
            .groupBy("ug1.userId")
            .setParameter("pointsForSameGame", this.pointsForSameGame)
    }

    /**
     * Calculates the score for the same friends as the current user. For each same friend, user gets constant points.
     */
    private getFriendScoreSubquery(qb: SelectQueryBuilder<User>, currentUserId: number) {
        return qb
            .subQuery()
            .select("uf1.userId", "userId")
            .addSelect("COUNT(*) * :pointsForSameFriend", "friendScore")
            .from(UsersFriend, "uf1")
            .innerJoin(UsersFriend, "uf2", "uf1.friendId = uf2.friendId")
            .where("uf2.userId = :currentUserId", {currentUserId})
            .groupBy("uf1.userId")
            .setParameter("pointsForSameFriend", this.pointsForSameFriend)
    }
}