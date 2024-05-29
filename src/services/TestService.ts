import {injectable} from "tsyringe";
import {ModelDataSource} from "../model/dataSource";
import {User} from "../model/user";
import {Game} from "../model/game";
import {UsersGame} from "../model/usersGame";
import {UsersFriend} from "../model/usersFriend";
import {City} from "../model/city";
import {Image} from "../model/image";

@injectable()
export class TestService {
    protected readonly _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    async generateTestData() {
        const userRepository = this._dbContext.getRepository(User);
        const gameRepository = this._dbContext.getRepository(Game);
        const usersGameRepository = this._dbContext.getRepository(UsersGame);
        const usersFriendRepository = this._dbContext.getRepository(UsersFriend);
        const imageRepository = this._dbContext.getRepository(Image);
        const cityRepository = this._dbContext.getRepository(City);

        // Создание игр
        const game1 = new Game();
        game1.name = 'Chess';
        game1.description = 'A classic game of strategy';
        game1.playerCount = '2';
        game1.ageRating = '6+';
        await gameRepository.save(game1);

        const game2 = new Game();
        game2.name = 'Monopoly';
        game2.description = 'A board game about real estate';
        game2.playerCount = '2-6';
        game2.ageRating = '8+';
        await gameRepository.save(game2);

        const game3 = new Game();
        game3.name = 'Poker';
        game3.description = 'A game of chance';
        game3.playerCount = '2-6';
        game3.ageRating = '10+';
        await gameRepository.save(game3);

        // Создание аватаров и городов
        const avatar1 = new Image();
        avatar1.blob = 'userimages/avatar1.png';
        await imageRepository.save(avatar1);

        const avatar2 = new Image();
        avatar2.blob = 'userimages/avatar2.png';
        await imageRepository.save(avatar2);

        const avatar3 = new Image();
        avatar3.blob = 'userimages/avatar3.png';
        await imageRepository.save(avatar3);

        const avatar4 = new Image();
        avatar4.blob = 'userimages/avatar4.png';
        await imageRepository.save(avatar4);

        const city1 = new City();
        city1.name = 'Perm';
        await cityRepository.save(city1);

        const city2 = new City();
        city2.name = 'Yekaterinburg';
        await cityRepository.save(city2);

        const city3 = new City();
        city3.name = 'Moscow';
        await cityRepository.save(city3);

        // Создание пользователей
        const user1 = new User();
        user1.username = 'user1';
        user1.passwordHash = '$2a$10$Q1CIRFhtIi0YYMBjj15lzeLIKyQkshYU8kiaKXktSn70CltYHXop2'; // 123456
        user1.email = 'user1@example.com';
        user1.displayName = 'Иван Иванов';
        user1.avatar = Promise.resolve(avatar1);
        user1.profileDescription = 'Являюсь заядлым геймером с детства. Играю в различные игры от шутеров до стратегий.';
        user1.birthday = new Date(1990, 1, 1);
        user1.contactInfo = 'user1@example.com';
        user1.city = Promise.resolve(city1);
        await userRepository.save(user1);

        const user2 = new User();
        user2.username = 'user2';
        user2.passwordHash = '$2a$10$Q1CIRFhtIi0YYMBjj15lzeLIKyQkshYU8kiaKXktSn70CltYHXop2';
        user2.email = 'user2@example.com';
        user2.displayName = 'User Two';
        user2.avatar = Promise.resolve(avatar2);
        user2.profileDescription = 'Enjoys board games. Likes to play with friends. Likes to spend time with family. Likes to travel.';
        user2.birthday = new Date(1985, 5, 15);
        user2.contactInfo = 'user2@example.com';
        user2.city = Promise.resolve(city2);
        await userRepository.save(user2);

        const user3 = new User();
        user3.username = 'user3';
        user3.passwordHash = '$2a$10$Q1CIRFhtIi0YYMBjj15lzeLIKyQkshYU8kiaKXktSn70CltYHXop2';
        user3.email = 'user3@example.com';
        user3.displayName = 'Елена Петрова';
        user3.avatar = Promise.resolve(avatar3);
        user3.profileDescription = 'Люблю активный образ жизни и спорт. Увлекаюсь путешествиями, особенно по горным районам. В свободное время занимаюсь фотографией и готовкой. Обожаю проводить время на свежем воздухе и наслаждаться природой. Играю в различные игры от шутеров до стратегий. 300 симв. 5 мая 1980 года. Москва. Россия. 8+';
        user3.birthday = new Date(2000, 10, 30);
        user3.contactInfo = 'user3@example.com';
        user3.city = Promise.resolve(city3);
        await userRepository.save(user3);

        const user4 = new User();
        user4.username = 'user4';
        user4.passwordHash = '$2a$10$Q1CIRFhtIi0YYMBjj15lzeLIKyQkshYU8kiaKXktSn70CltYHXop2';
        user4.email = 'user4@example.com';
        user4.displayName = 'User Four';
        user4.avatar = Promise.resolve(avatar4);
        user4.profileDescription = 'Without contact info and city';
        user4.birthday = new Date(2010, 8, 8);
        // user4.contactInfo
        // user4.city
        await userRepository.save(user4);

        const user5 = new User(); // Without games
        user5.username = 'user5';
        user5.passwordHash = '$2a$10$Q1CIRFhtIi0YYMBjj15lzeLIKyQkshYU8kiaKXktSn70CltYHXop2';
        user5.email = 'user5@example.com';
        user5.displayName = 'User Five';
        user5.avatar = Promise.resolve(avatar1);
        user5.profileDescription = 'Without games';
        user5.birthday = new Date(2002, 11, 5);
        user5.contactInfo = 'user5@example.com';
        user5.city = Promise.resolve(city1);
        await userRepository.save(user5);

        const user6 = new User();
        user6.username = 'user6';
        user6.passwordHash = '$2a$10$Q1CIRFhtIi0YYMBjj15lzeLIKyQkshYU8kiaKXktSn70CltYHXop2';
        user6.email = 'user6@example.com';
        user6.displayName = '';
        user6.avatar = Promise.resolve(avatar2);
        user6.profileDescription = 'Empty display name';
        user6.birthday = new Date(2005, 6, 5);
        user6.contactInfo = 'user6@example.com';
        user6.city = Promise.resolve(city3);
        await userRepository.save(user6);

        // Связь пользователей и игр
        const usersGame1 = new UsersGame();
        usersGame1.user = Promise.resolve(user1);
        usersGame1.game = Promise.resolve(game1);
        await usersGameRepository.save(usersGame1);

        const usersGame2 = new UsersGame();
        usersGame2.user = Promise.resolve(user2);
        usersGame2.game = Promise.resolve(game2);
        await usersGameRepository.save(usersGame2);

        const usersGame3 = new UsersGame();
        usersGame3.user = Promise.resolve(user3);
        usersGame3.game = Promise.resolve(game1);
        await usersGameRepository.save(usersGame3);

        const usersGame4 = new UsersGame();
        usersGame4.user = Promise.resolve(user3);
        usersGame4.game = Promise.resolve(game2);
        await usersGameRepository.save(usersGame4);

        const usersGame5 = new UsersGame();
        usersGame5.user = Promise.resolve(user6);
        usersGame5.game = Promise.resolve(game3);
        await usersGameRepository.save(usersGame5);

        // Связь друзей
        const usersFriend1 = new UsersFriend();
        usersFriend1.user = Promise.resolve(user1);
        usersFriend1.friend = Promise.resolve(user2);
        await usersFriendRepository.save(usersFriend1);

        const usersFriend2 = new UsersFriend();
        usersFriend2.user = Promise.resolve(user2);
        usersFriend2.friend = Promise.resolve(user3);
        await usersFriendRepository.save(usersFriend2);
    }
}
