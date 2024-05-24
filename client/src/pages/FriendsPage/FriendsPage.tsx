import { Tab, Tabs } from "react-bootstrap";
import FriendsList from "./FriendsList";
import IncomingFriendRequestsList from "./IncomingFriendRequestsList";
import OutgoingFriendRequestsList from "./OutgoingFriendRequestsList";

const MyFriendsPage = () => {
    return (
        <Tabs>
            <Tab title='Мои друзья' eventKey='friends-list' className="p-2">
                <FriendsList />
            </Tab>
            <Tab title='Входящие заявки' eventKey='incoming-list' className="p-2">
                <IncomingFriendRequestsList />
            </Tab>
            <Tab title='Исходящие заявки' eventKey='outgoing-list' className="p-2">
                <OutgoingFriendRequestsList />
            </Tab>
        </Tabs>
    );
};

export default MyFriendsPage;
