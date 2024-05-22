import { AuthMiddleware, AuthMiddlewareBag } from "../middleware/AuthMiddleware";
import { ModelDataSource } from "../model/dataSource";
import { UsersFriend } from "../model/usersFriend";
import { Controller } from "../modules/core/controllers/decorators";
import { Middleware } from "../modules/core/middleware/middleware";
import { Return } from "../modules/core/mimeType/decorators";
import { HTTPResponseConvertBody } from "../modules/core/routing/core";
import { GET } from "../modules/core/routing/decorators";
import { QueryArgument } from "../modules/core/routing/query";
import { badRequest } from "../modules/core/routing/response";

type ListQuery = {
    start?: number;
    count?: number;
};

type FriendData = {
    username: string;
    displayName: string;
    avatarPath?: string;
};

@Controller('api/v1/user/@current/friends')
export class FriendsController {
    protected static readonly MAX_QUERY_COUNT : number = 100; 

    protected _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    @GET('current')
    @Middleware(AuthMiddleware)
    @QueryArgument('start', {
        typeId: 'int',
        optional: true,
        canHaveMultipleValues: false
    })
    @QueryArgument('count', {
        typeId: 'int',
        optional: true,
        canHaveMultipleValues: false
    })
    @Return('application/json')
    async getFriendsList(bag: AuthMiddlewareBag, queryBag: ListQuery): Promise<HTTPResponseConvertBody | FriendData[]> {
        const start = queryBag.start ?? 0;
        const count = queryBag.count ?? FriendsController.MAX_QUERY_COUNT;

        if (count < 0 || count > FriendsController.MAX_QUERY_COUNT)
            return badRequest();

        const repo = this._dbContext.getRepository(UsersFriend);
        
        const usersFriends = await repo.createQueryBuilder('friendLink')
                                       .innerJoin(UsersFriend, 'backwardsLink', 'friendLink.userId = :userId AND backwardsLink.userId = friendLink.friendId', {userId: bag.user.id})
                                       .innerJoin('friendLink.friend', 'friend')
                                       .leftJoin('friend.avatar', 'avatar')
                                       .skip(start)
                                       .take(count)
                                       .getMany();

        return await Promise.all(usersFriends.map(async x => {
            let user = await x.friend;
            return {
                username: user.username,
                displayName: user.displayName ?? user.username,
                avatarPath: (await user.avatar)?.blob
            };
        }));
    }
}