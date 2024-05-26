import { useCallback } from "react";
import useDynamicList from "../../utils/useDynamicList";
import FriendData from "./FriendData";
import useScroll from "../../utils/useScroll";
import useApi from "../../http-common";

export type FriendsListProps = {
    friendItemTemplate: (friend: FriendData) => JSX.Element;
    friendListUrlBuilder: (currentLength: number) => string;
}

const FriendsList = ({ friendItemTemplate, friendListUrlBuilder }: FriendsListProps) => {
    const api = useApi();

    const friendsListLoader = useCallback(async (oldArr: ReadonlyArray<FriendData>) => {
        try {
            const response = await api.get(friendListUrlBuilder(oldArr.length));
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
    }, [api, friendListUrlBuilder]);

    const [friendsList, loadFriendsList] = useDynamicList(friendsListLoader);

    const scrollCallback = useCallback((event: Event) => {
        if (document.documentElement.scrollHeight - window.scrollY - window.innerHeight < window.innerHeight)
            loadFriendsList();
    }, [loadFriendsList]);

    useScroll(document, scrollCallback);

    return (
        <div className="bg-secondary-subtle p-2">
        {
            friendsList ? 
            friendsList.map(friendItemTemplate) :
            <span>Загрузка...</span>
        }
        </div>
    );
};

export default FriendsList;