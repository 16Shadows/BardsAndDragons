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

type SortedListQuery = {
    start?: number;
    count?: number;
    sortBy?: string;
    sortOrder?: string;
};

type FriendData = {
    username: string;
    displayName: string;
    avatarPath?: string;
};

@Controller('api/v1/user')
export class FriendsController {
    protected static readonly MAX_QUERY_COUNT : number = 100;
    protected static readonly SORT_OPTIONS : Set<string> = new Set(['name']);
    protected static readonly SORT_ORDER_OPTIONS : Set<string> = new Set(['ASC', 'DESC']);

    protected _dbContext: ModelDataSource;
    protected _NotificationService: UserNotificationService;

    constructor(dbContext: ModelDataSource, notificationService: UserNotificationService) {
        this._dbContext = dbContext;
        this._NotificationService = notificationService;
    }

    //Query current friends list
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
    @QueryArgument('sortBy', {
        optional: true,
        canHaveMultipleValues: false
    })
    @QueryArgument('sortOrder', {
        optional: true,
        canHaveMultipleValues: false
    })
    @Return('application/json')
    async getFriendsList(bag: AuthMiddlewareBag, queryBag: SortedListQuery): Promise<HTTPResponseConvertBody | FriendData[]> {
        const start = queryBag.start ?? 0;
        const count = queryBag.count ?? FriendsController.MAX_QUERY_COUNT;
        const sortBy = queryBag.sortBy ?? FriendsController.SORT_OPTIONS.keys().next().value;
        const sortOrder = queryBag.sortOrder ?? FriendsController.SORT_ORDER_OPTIONS.keys().next().value;

        if (count < 0 || count > FriendsController.MAX_QUERY_COUNT || !FriendsController.SORT_OPTIONS.has(sortBy) || !FriendsController.SORT_ORDER_OPTIONS.has(sortOrder))
            return badRequest();

        const repo = this._dbContext.getRepository(UsersFriend);
        
        const usersFriends = await repo.createQueryBuilder('friendLink')
                                        .innerJoin(UsersFriend, 'backwardsLink', 'backwardsLink.userId = friendLink.friendId AND backwardsLink.friendId = friendLink.userId') //By using inner join here we only keep the entries which have a backwards link (thus a two-way friend link between users exists)
                                        .innerJoin('friendLink.friend', 'friend')
                                        .leftJoin('friend.avatar', 'avatar')
                                        .where('friendLink.userId = :userId', {userId: bag.user.id})
                                        .addSelect('COALESCE(friend.displayName, friend.username)', 'name')
                                        .orderBy(sortBy, sortOrder)
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

    //Query incoming friends list
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
    @QueryArgument('sortBy', {
        optional: true,
        canHaveMultipleValues: false
    })
    @QueryArgument('sortOrder', {
        optional: true,
        canHaveMultipleValues: false
    })
    @Return('application/json')
    async getIncomingRequestsList(bag: AuthMiddlewareBag, queryBag: SortedListQuery): Promise<HTTPResponseConvertBody | FriendData[]> {
        const start = queryBag.start ?? 0;
        const count = queryBag.count ?? FriendsController.MAX_QUERY_COUNT;
        const sortBy = queryBag.sortBy ?? FriendsController.SORT_OPTIONS.keys().next().value;
        const sortOrder = queryBag.sortOrder ?? FriendsController.SORT_ORDER_OPTIONS.keys().next().value;

        if (count < 0 || count > FriendsController.MAX_QUERY_COUNT || !FriendsController.SORT_OPTIONS.has(sortBy) || !FriendsController.SORT_ORDER_OPTIONS.has(sortOrder))
            return badRequest();

        const repo = this._dbContext.getRepository(UsersFriend);
        
        const incomingRequests = await repo.createQueryBuilder('friendLink')
                                       .leftJoin(UsersFriend, 'backwardsLink', 'friendLink.userId = backwardsLink.friendId AND friendLink.friendId = backwardsLink.userId') //Left join to check if the entry has a backwards link
                                       .where('backwardsLink.id IS NULL AND friendLink.friendId = :userId', {userId: bag.user.id}) //Select entries where target is this user. Skip entries which have backwards link. Remaining links are incoming requests.
                                       .innerJoin('friendLink.user', 'friend')
                                       .leftJoin('friend.avatar', 'avatar')
                                       .addSelect('COALESCE(friend.displayName, friend.username)', 'name')
                                       .orderBy(sortBy, sortOrder)
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

    //Query outgoing friends list
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
    @QueryArgument('sortBy', {
        optional: true,
        canHaveMultipleValues: false
    })
    @QueryArgument('sortOrder', {
        optional: true,
        canHaveMultipleValues: false
    })
    @Return('application/json')
    async getOutgoingRequestsList(bag: AuthMiddlewareBag, queryBag: SortedListQuery): Promise<HTTPResponseConvertBody | FriendData[]> {
        const start = queryBag.start ?? 0;
        const count = queryBag.count ?? FriendsController.MAX_QUERY_COUNT;
        const sortBy = queryBag.sortBy ?? FriendsController.SORT_OPTIONS.keys().next().value;
        const sortOrder = queryBag.sortOrder ?? FriendsController.SORT_ORDER_OPTIONS.keys().next().value;

        if (count < 0 || count > FriendsController.MAX_QUERY_COUNT || !FriendsController.SORT_OPTIONS.has(sortBy) || !FriendsController.SORT_ORDER_OPTIONS.has(sortOrder))
            return badRequest();

        const repo = this._dbContext.getRepository(UsersFriend);
        
        const incomingRequests = await repo.createQueryBuilder('friendLink')
                                       .leftJoin(UsersFriend, 'backwardsLink', 'friendLink.userId = backwardsLink.friendId AND friendLink.friendId = backwardsLink.userId') //Left join to find backwards links
                                       .where('backwardsLink.id IS NULL AND friendLink.userId = :userId', {userId: bag.user.id}) //Keep only links which come from this user and have no associated backwards link
                                       .innerJoin('friendLink.friend', 'friend')
                                       .leftJoin('friend.avatar', 'avatar')
                                       .addSelect('COALESCE(friend.displayName, friend.username)', 'name')
                                       .orderBy(sortBy, sortOrder)
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
        
        try {
            await repo.save(friendLink);
        }
        catch {
            return conflict();
        }

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
            return badRequest();

        try {
            await repo.remove(friendLink);
        }
        catch {
            return badRequest();
        }

        const notifRepo = this._dbContext.getRepository(NotificationBase);
        await notifRepo.remove(
            await notifRepo.createQueryBuilder('notif')
                            .innerJoinAndSelect('notif.friendRequest', 'friendRequest')
                            .where('friendRequest.userId = :userId', {userId: bag.user.id})
                            .getMany()
        );
    }

    @GET('{username}/friendshipStatus')
    @Middleware(AuthMiddleware)
    @Return('application/json')
    async getFriendshipStatus(bag: AuthMiddlewareBag, username: string): Promise<HTTPResponseConvertBody | { status: string }> {
        const repo = this._dbContext.getRepository(UsersFriend);
        const userRepo = this._dbContext.getRepository(User);
        
        const friendUser = await userRepo.findOne({ where: { username } });

        if (!friendUser) {
            return notFound();
        }

        const isFriend = await repo.findOne({
            where: {
                user: bag.user,
                friend: friendUser
            }
        });

        const isReverseFriend = await repo.findOne({
            where: {
                user: friendUser,
                friend: bag.user
            }
        });

        if (isFriend && isReverseFriend) {
            return { status: 'friends' };
        } else if (!isFriend && isReverseFriend) {
            return { status: 'incomingRequest' };
        } else if (isFriend && !isReverseFriend) {
            return { status: 'outgoingRequest' };
        } else {
            return { status: 'none' };
        }
    }
}