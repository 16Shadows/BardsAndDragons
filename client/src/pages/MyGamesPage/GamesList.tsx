import { useCallback, useState } from "react";
import useDynamicList from "../../utils/useDynamicList";
import GameData from "./GameData";
import useScroll from "../../utils/useScroll";
import useApi from "../../http-common";

export type GamesListSortBy = 'name';
export type GamesListSortOrder = 'ASC' | 'DESC';

export type GamesListProps = {
    gameItemTemplate: (game: GameData) => JSX.Element; //A function used to convert each friend entry into a JSXElement
    gameListUrlBuilder: (currentLength: number, sortBy: string, sortOrder: string) => string; //A function used to build batch loader's URL based on the parameters.
}

type SortOption = {
    name: string;
    sortBy: GamesListSortBy;
    sortOrder: GamesListSortOrder;
}

const SORT_OPTIONS: SortOption[] = [
    { name: 'Имя (А -> Я)', sortBy: 'name', sortOrder: 'ASC' },
    { name: 'Имя (Я -> А)', sortBy: 'name', sortOrder: 'DESC' }
];

const GamesList = ({ gameItemTemplate, gameListUrlBuilder }: GamesListProps) => {
    const api = useApi();
    const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0].name);
    const [sortBy, setSortBy] = useState<GamesListSortBy>(SORT_OPTIONS[0].sortBy);
    const [sortOrder, setSortOrder] = useState<GamesListSortOrder>(SORT_OPTIONS[0].sortOrder);

    //Batch-loader for friends list
    const gamesListLoader = useCallback(async (oldArr: ReadonlyArray<GameData>) => {
        try {
            const response = await api.get(gameListUrlBuilder(oldArr.length, sortBy, sortOrder)); //Query API for the next batch using url builder
            return {
                list: oldArr.concat(response.data),
                isFinal: response.data.length === 0
            };
        }
        catch {
            return {
                list: oldArr,
                isFinal: false
            };
        }
    }, [api, gameListUrlBuilder, sortBy, sortOrder]);

    const [gamesList, loadGamesList] = useDynamicList(gamesListLoader);

    //Callback for scrolling
    const scrollCallback = useCallback((event: Event) => {
        if (document.documentElement.scrollHeight - window.scrollY - window.innerHeight < window.innerHeight)
            loadGamesList();
    }, [loadGamesList]);

    //Invoke the callback when document is scrolled
    useScroll(document, scrollCallback);

    //sort change handler
    const sortChangedCallback = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const name = event.currentTarget.value;
        const option = SORT_OPTIONS.find(x => x.name === name);
        if (!option)
            return;
        setSortOption(option.name);
        setSortBy(option.sortBy);
        setSortOrder(option.sortOrder);
    }, [setSortBy, setSortOrder, setSortOption]);

    return (
        <div>
            <div className="d-flex ">
                <strong className="me-1">Сортировка:</strong>
                <select onChange={sortChangedCallback} defaultValue={sortOption} className="mb-2">
                    {
                        SORT_OPTIONS.map(x => {
                            return <option key={x.name} value={x.name}>{x.name}</option>
                        })
                    }
                </select>
            </div>
            <div className="bg-secondary-subtle p-2">
                {gamesList ? (
                    gamesList.map(gameItemTemplate)
                ) : (
                    <span>Загрузка...</span>
                )}
            </div>
        </div>
    );
};

export default GamesList;