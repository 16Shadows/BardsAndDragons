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

    /**
     * Returns a list of potential players for the current user
     */
    async getPotentialPlayers(currentUser: User): Promise<User[]> {
        const query = await this.getPotentialPlayersQuery(currentUser);
        return await query.getMany();
    }

    /**
     * Returns a query builder for the list of potential players for the current user
     */
    async getPotentialPlayersQuery(currentUser: User): Promise<SelectQueryBuilder<User>> {
        const repo = this._dbContext.getRepository(User);

        return repo
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.games", "usersGame")
            .leftJoinAndSelect("user.avatar", "avatar")
            .leftJoinAndSelect("user.city", "city")

            .where("user.id != :userId", {userId: currentUser.id}) // exclude the current user
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
                return "EXISTS " + subQuery;
            })

            // Exclude users who are already friends with the current user
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select("usersFriend.friendId")
                    .from(UsersFriend, "usersFriend")
                    .where("usersFriend.userId = :userId")
                    .andWhere("usersFriend.friendId = user.id")
                    .getQuery();
                return "NOT EXISTS " + subQuery;
            }, {userId: currentUser.id})

            // Exclude users who have been rejected by or have rejected the current user
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select("rejectedMatch.receiverId")
                    .from(RejectedMatch, "rejectedMatch")
                    .where("(rejectedMatch.initiatorId = :userId AND rejectedMatch.receiverId = user.id) OR (rejectedMatch.initiatorId = user.id AND rejectedMatch.receiverId = :userId)")
                    .getQuery();
                return "NOT EXISTS " + subQuery;
            }, {userId: currentUser.id});
    }

    // TODO: добавить подбор игроков по параметрам: теги игр
}