import {injectable} from "tsyringe";
import {ModelDataSource} from "../model/dataSource";
import {User} from "../model/user";
import {UsersGame} from "../model/usersGame";
import {UsersFriend} from "../model/usersFriend";
import {RejectedMatch} from "../model/rejectedMatch";
import {SelectQueryBuilder} from "typeorm";

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

    async getPotentialPlayers(currentUser: User): Promise<any[]> {
        const potentialPlayersQuery = this.getPotentialPlayersQuery(currentUser.id);
        return await potentialPlayersQuery.getRawMany();
    }

    async getRankedPlayers(currentUser: User): Promise<any[]> {
        const potentialPlayersQuery = this.getPotentialPlayersQuery(currentUser.id);
        const rankedPlayersQuery = this.getRankedPlayersQuery(potentialPlayersQuery, currentUser.id);
        return await rankedPlayersQuery.getRawMany();
    }

    /**
     * Returns a query builder for the list of potential players for the current user
     */
    private getPotentialPlayersQuery(currentUserId: number): SelectQueryBuilder<User> {
        const repo = this._dbContext.getRepository(User);
        return repo
            .createQueryBuilder("user")
            // Select only user id
            .select("user.id", "id")
            .distinct(true)

            .where("user.id != currentUser.id") // exclude the current user
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
            })

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

            // Set the current user
            .addFrom(User, "currentUser")
            .andWhere("currentUser.id = :currentUserId", {currentUserId})
    }

    // TODO: add a selection of players according to the parameters:
    //  5. The more game tags match, the higher the score
    //  6. Mix a random number?
    /**
     * Returns a query builder for the list of ranked players for the current user.
     *
     * Rank is based on:
     * 1. Same cities
     * 2. Smaller the age difference, the higher the score
     * 3. More common games, the higher the score
     * 4. More common friends, the higher the score
     */
    private getRankedPlayersQuery(potentialPlayersQuery: SelectQueryBuilder<User>, currentUserId: number) {
        const repo = this._dbContext.getRepository(User);

        // Add subqueries for city and age scores
        this.addCityScoreSubquery(potentialPlayersQuery);
        this.addAgeScoreSubquery(potentialPlayersQuery);

        const query = repo
            .createQueryBuilder("user")
            .select("user.username", "username")
            // Sum all scores
            .addSelect(`
                COALESCE("potentialPlayers"."cityScore", 0) +
                COALESCE("potentialPlayers"."ageScore", 0) +
                COALESCE("gameScoreSubquery"."gameScore", 0) +
                COALESCE("friendScoreSubquery"."friendScore", 0)
            `, "totalScore")
            .innerJoin(`(${potentialPlayersQuery.getQuery()})`, "potentialPlayers", `"potentialPlayers"."id" = "user"."id"`);

        const gameScoreSubquery = this.getGameScoreSubquery(query, currentUserId);
        const friendScoreSubquery = this.getFriendScoreSubquery(query, currentUserId);
        return query
            .leftJoin(`(${gameScoreSubquery.getQuery()})`, "gameScoreSubquery", `"gameScoreSubquery"."userId" = "user"."id"`)
            .leftJoin(`(${friendScoreSubquery.getQuery()})`, "friendScoreSubquery", `"friendScoreSubquery"."userId" = "user"."id"`)
            .orderBy(`"totalScore"`, "DESC")
            // Set parameters for calculation of scores
            .setParameter("pointsForSameCity", this.pointsForSameCity)
            .setParameter("pointsForSameAge", this.pointsForSameAge)
    }

    /**
     * Calculate the score for the same city as the current user. If cities are the same, user gets constant points
     */
    private addCityScoreSubquery(qb: SelectQueryBuilder<User>) {
        qb
            .addSelect(`CASE WHEN "user"."cityId" = "currentUser"."cityId" THEN :pointsForSameCity ELSE 0 END`, "cityScore")
    }

    /**
     * Calculate the score for the same age as the current user. The bigger the difference, the fewer points will be given to the user
     */
    private addAgeScoreSubquery(qb: SelectQueryBuilder<User>) {
        qb
            .addSelect(
                `:pointsForSameAge - ABS(EXTRACT(YEAR FROM "user"."birthday") - EXTRACT(YEAR FROM "currentUser"."birthday"))`,
                "ageScore")
    }

    /**
     * Calculate the score for the same games as the current user. For each same game, user gets constant points
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
     * Calculate the score for the same friends as the current user. For each same friend, user gets constant points
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