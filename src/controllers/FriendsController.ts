import { AuthMiddleware, AuthMiddlewareBag } from "../middleware/AuthMiddleware";
import { ModelDataSource } from "../model/dataSource";
import { NotificationBase } from "../model/notifications/notificationBase";
import { User } from "../model/user";
import { UsersFriend } from "../model/usersFriend";
import { Controller } from "../modules/core/controllers/decorators";
import { Middleware } from "../modules/core/middleware/middleware";
import { Accept, Return } from "../modules/core/mimeType/decorators";
import { HTTPResponseConvertBody } from "../modules/core/routing/core";
import { GET, POST } from "../modules/core/routing/decorators";
import { QueryArgument } from "../modules/core/routing/query";
import { badRequest, conflict, notFound } from "../modules/core/routing/response";
import { UserNotificationService } from "../services/UserNotificationService";

type ListQuery = {
    start?: number;
    count?: number;
};

type FriendData = {
    username: string;
    displayName: string;
    avatarPath?: string;
};

@Controller('api/v1/user')
export class FriendsController {
    protected static readonly MAX_QUERY_COUNT : number = 100; 

    protected _dbContext: ModelDataSource;
    protected _NotificationService: UserNotificationService;

    constructor(dbContext: ModelDataSource, notificationService: UserNotificationService) {
        this._dbContext = dbContext;
        this._NotificationService = notificationService;
    }

    @GET('@current/friends/current')
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

    @GET('@current/friends/incoming')
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
    async getIncomingRequestsList(bag: AuthMiddlewareBag, queryBag: ListQuery): Promise<HTTPResponseConvertBody | FriendData[]> {
        const start = queryBag.start ?? 0;
        const count = queryBag.count ?? FriendsController.MAX_QUERY_COUNT;

        if (count < 0 || count > FriendsController.MAX_QUERY_COUNT)
            return badRequest();

        const repo = this._dbContext.getRepository(UsersFriend);
        
        const incomingRequests = await repo.createQueryBuilder('friendLink')
                                       .leftJoin(UsersFriend, 'backwardsLink', 'friendLink.userId = backwardsLink.friendId')
                                       .innerJoin('friendLink.user', 'friend', 'friendLink.friendId = :userId', {userId: bag.user.id})
                                       .leftJoin('friend.avatar', 'avatar')
                                       .where('backwardsLink.id IS NULL')
                                       .skip(start)
                                       .take(count)
                                       .getMany();

        return await Promise.all(incomingRequests.map(async x => {
            let user = await x.user;
            return {
                username: user.username,
                displayName: user.displayName ?? user.username,
                avatarPath: (await user.avatar)?.blob
            };
        }));
    }

    @GET('@current/friends/outgoing')
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
    async getOutgoingRequestsList(bag: AuthMiddlewareBag, queryBag: ListQuery): Promise<HTTPResponseConvertBody | FriendData[]> {
        const start = queryBag.start ?? 0;
        const count = queryBag.count ?? FriendsController.MAX_QUERY_COUNT;

        if (count < 0 || count > FriendsController.MAX_QUERY_COUNT)
            return badRequest();

        const repo = this._dbContext.getRepository(UsersFriend);
        
        const incomingRequests = await repo.createQueryBuilder('friendLink')
                                       .leftJoin(UsersFriend, 'backwardsLink', 'friendLink.friendId = backwardsLink.userId')
                                       .innerJoin('friendLink.friend', 'friend')
                                       .leftJoin('friend.avatar', 'avatar')
                                       .where('backwardsLink.id IS NULL AND friendLink.userId = :userId', {userId: bag.user.id})
                                       .skip(start)
                                       .take(count)
                                       .getMany();

        return await Promise.all(incomingRequests.map(async x => {
            let user = await x.friend;
            return {
                username: user.username,
                displayName: user.displayName ?? user.username,
                avatarPath: (await user.avatar)?.blob
            };
        }));
    }

    @POST('{friend:user}/addFriend')
    @Middleware(AuthMiddleware)
    @Accept('application/json', 'text/plain')
    async addFriend(bag: AuthMiddlewareBag, friendUser: User) {
        const repo = this._dbContext.getRepository(UsersFriend);

        if (await repo.existsBy({user: bag.user,friend: friendUser}))
            return conflict();

        const friendLink = new UsersFriend();
        friendLink.user = Promise.resolve(bag.user);
        friendLink.friend = Promise.resolve(friendUser);
        
        await repo.save(friendLink);

        await this._NotificationService.sendNotification(friendUser.username,
            await repo.existsBy({user:friendUser,friend: bag.user})
            ?
            {
                type: 'friendRequestAccepted',
                friendRequestAcceptedBy: {
                    username: bag.user.username,
                    displayName: bag.user.displayName ?? bag.user.username
                },
                seen: false
            }
            :
            {
                type: 'friendRequest',
                friendRequestSentBy: {
                    username: bag.user.username,
                    displayName: bag.user.displayName ?? bag.user.username
                },
                seen: false
            }
        )
    }

    @POST('{friend:user}/removeFriend')
    @Middleware(AuthMiddleware)
    @Accept('application/json', 'text/plain')
    async removeFriend(bag: AuthMiddlewareBag, friendUser: User) {
        const repo = this._dbContext.getRepository(UsersFriend);

        const friendLink = await repo.findOneBy({
            user: bag.user,
            friend: friendUser
        });

        if (!friendLink)
            return notFound();

        await repo.remove(friendLink);

        const notifRepo = this._dbContext.getRepository(NotificationBase);
        await notifRepo.remove(
            await notifRepo.createQueryBuilder('notif')
                            .innerJoinAndSelect('notif.friendRequest', 'friendRequest')
                            .where('friendRequest.userId = :userId', {userId: bag.user.id})
                            .getMany()
        );
    }
}