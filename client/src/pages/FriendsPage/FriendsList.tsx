import { useCallback } from "react";
import useDynamicList, { ListStateConversionResult } from "../../utils/useDynamicList";
import FriendData from "./FriendData";
import useApi from "../../http-common";
import useScroll from "../../utils/useScroll";
import FriendItem from "./FriendItem";


const FriendsList = () => {
    const api = useApi();

    const friendsListLoader = useCallback((oldArr: ReadonlyArray<FriendData>): Promise<ListStateConversionResult<FriendData>> => {
        return api.get(`user/@current/friends/current?start=${oldArr.length}`)
                .then(response => {return {
                    list: oldArr.concat(response.data),
                    isFinal: response.data.length === 0
                }});
    }, [api]);

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
            friendsList.map(x => {
                return <FriendItem friend={x} key={x.username}/>;
            }) :
            <span>Загрузка...</span>
        }
        </div>
    );
};

export default FriendsList;