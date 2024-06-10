import { useCallback, useState } from "react";
import useDynamicList from "../../utils/useDynamicList";
import FriendData from "./FriendData";
import useScroll from "../../utils/useScroll";
import useApi from "../../http-common";

export type FriendsListSortBy = 'name';
export type FriendsListSortOrder = 'ASC' | 'DESC';

export type FriendsListProps = {
    friendItemTemplate: (friend: FriendData) => JSX.Element;
    friendListUrlBuilder: (currentLength: number, sortBy: string, sortOrder: string) => string;
}

type SortOption = {
    name: string;
    sortBy: FriendsListSortBy;
    sortOrder: FriendsListSortOrder;
}

const SORT_OPTIONS : SortOption[] = [
    {name: 'Имя (А -> Я)', sortBy: 'name', sortOrder: 'ASC'},
    {name: 'Имя (Я -> А)', sortBy: 'name', sortOrder: 'DESC'}
];

const FriendsList = ({ friendItemTemplate, friendListUrlBuilder }: FriendsListProps) => {
    const api = useApi();
    const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS[0].name);
    const [sortBy, setSortBy] = useState<FriendsListSortBy>(SORT_OPTIONS[0].sortBy);
    const [sortOrder, setSortOrder] = useState<FriendsListSortOrder>(SORT_OPTIONS[0].sortOrder);

    const friendsListLoader = useCallback(async (oldArr: ReadonlyArray<FriendData>) => {
        try {
            const response = await api.get(friendListUrlBuilder(oldArr.length, sortBy, sortOrder));
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
    }, [api, friendListUrlBuilder, sortBy, sortOrder]);

    const [friendsList, loadFriendsList] = useDynamicList(friendsListLoader);

    const scrollCallback = useCallback((event: Event) => {
        if (document.documentElement.scrollHeight - window.scrollY - window.innerHeight < window.innerHeight)
            loadFriendsList();
    }, [loadFriendsList]);

    useScroll(document, scrollCallback);

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
            <div className="d-flex">
                <strong className="me-1">Порядок: </strong>
                <select onChange={sortChangedCallback} defaultValue={sortOption} className="mb-2">
                {
                    SORT_OPTIONS.map(x => {
                        return <option key={x.name} value={x.name}>{x.name}</option>
                    })
                }
                </select>
            </div>
            <div className="bg-secondary-subtle p-2">
            {
                friendsList ? 
                friendsList.map(friendItemTemplate) :
                <span>Загрузка...</span>
            }
            </div>
        </div>
    );
};

export default FriendsList;