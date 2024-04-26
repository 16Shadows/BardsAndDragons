import { Game } from "../model/game";
import { Controller } from "../modules/core/controllers/decorators";
import { MiddlewareBag } from "../modules/core/middleware/middleware";
import { Return } from "../modules/core/mimeType/decorators";
import { GET } from "../modules/core/routing/decorators";

type GameInfo = {
    id: number;
    name: string;
    playerCount: string;
    ageRating: string;
    description: string;
    tags: string[];
    images: string[];
}

@Controller('api/v1/games')
export class GameController extends Object {
    @GET('{game:game}')
    @Return('application/json')
    async getGameInfo(bag: MiddlewareBag, game: Game): Promise<GameInfo> {
        return {
            id: game.id,
            name: game.name,
            playerCount: game.playerCount,
            ageRating: game.ageRating,
            description: game.description,
            tags: (await game.tags).map(x => x.text),
            images: (await game.images).map(x => x.path)
        };
    }
}