import { Tab, Tabs } from "react-bootstrap";
import FriendsList from "./FriendsList";

const MyFriendsPage = () => {
    return (
        <Tabs>
            <Tab title='Мои друзья' eventKey='friends-list' className="p-2">
                <FriendsList />
            </Tab>
        </Tabs>
    );
};

export default MyFriendsPage;
