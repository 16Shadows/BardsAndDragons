import {injectable} from "tsyringe";
import {ModelDataSource} from "../model/dataSource";
import {User} from "../model/user";
import {UsersGame} from "../model/usersGame";
import {UsersFriend} from "../model/usersFriend";
import {RejectedMatch} from "../model/rejectedMatch";
import {SelectQueryBuilder} from "typeorm";

@injectable()
export class MatchingService {
    protected readonly _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    async getPotentialPlayers(currentUser: User): Promise<any[]> {
        const potentialPlayersQuery = await this.getPotentialPlayersQuery(currentUser);
        return await potentialPlayersQuery.getRawMany();
    }

    async getRankedPlayers(currentUser: User): Promise<any[]> {
        const potentialPlayersQuery = await this.getPotentialPlayersQuery(currentUser);
        const rankedPlayersQuery = await this.getRankedPlayersQuery(currentUser, potentialPlayersQuery);
        return await rankedPlayersQuery.getRawMany();
    }

    /**
     * Returns a query builder for the list of potential players for the current user
     */
    async getPotentialPlayersQuery(currentUser: User): Promise<SelectQueryBuilder<User>> {
        const repo = this._dbContext.getRepository(User);
        return repo
            .createQueryBuilder("user")
            // Select only user id
            .select("user.id", "id")
            .distinct(true)

            .where("user.id != :userId") // exclude the current user
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
                    .where("usersFriend.userId = :userId")
                    .andWhere("usersFriend.friendId = user.id")
                    .getQuery();
                return `NOT EXISTS ${subQuery}`;
            })

            // Exclude users who have been rejected by or have rejected the current user
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select("rejectedMatch.receiverId")
                    .from(RejectedMatch, "rejectedMatch")
                    .where("(rejectedMatch.initiatorId = :userId AND rejectedMatch.receiverId = user.id) OR (rejectedMatch.initiatorId = user.id AND rejectedMatch.receiverId = :userId)")
                    .getQuery();
                return `NOT EXISTS ${subQuery}`;
            })

            // Set the parameter for the current user
            .setParameter("userId", currentUser.id);
    }

    // TODO: добавить подбор игроков по параметрам: теги игр
    /**
     * Returns a query builder for the list of ranked players for the current user. Rank is based on scores
     */
    async getRankedPlayersQuery(currentUser: User, potentialPlayersQuery: SelectQueryBuilder<User>): Promise<SelectQueryBuilder<UsersGame>> {
        const repo = this._dbContext.getRepository(UsersGame);
        return repo
            .createQueryBuilder("usersGame")

            .select("COUNT(usersGame.gameId)", "gamesScore")
            .addSelect("usersGame.userId", "userId")

            // Add table with potential players
            .addCommonTableExpression(potentialPlayersQuery, "potentialPlayers")

            .where(qb => {
                // Get all games that the current user has played
                const subQuery = qb.subQuery()
                    .select("usersGame.gameId")
                    .from(UsersGame, "usersGame")
                    .where("usersGame.userId = :userId")
                    .getQuery();
                return `usersGame.gameId IN (${subQuery})`;
            })

            .andWhere(`usersGame.userId IN (SELECT "id" FROM "potentialPlayers")`)
            .groupBy("usersGame.userId")
            .orderBy(`"gamesScore"`, "DESC");
    }
}