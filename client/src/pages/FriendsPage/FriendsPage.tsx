import { Button, Tab, Tabs } from "react-bootstrap";
import FriendsList from "./FriendsList";
import FriendItem from "./FriendItem";

const MyFriendsPage = () => {
    return (
        <Tabs>
            <Tab title='Мои друзья' eventKey='friends-list' className="p-2">
                <FriendsList 
                    friendItemTemplate={(x) => {
                        return (
                            <FriendItem friend={x} key={x.username}>
                                <Button variant='outline-danger'>Удалить</Button>
                            </FriendItem>
                        )
                    }}
                    friendListUrlBuilder={(len) => `user/@current/friends/current?start=${len}`}
                />
            </Tab>
            <Tab title='Входящие заявки' eventKey='incoming-list' className="p-2">
                <FriendsList 
                    friendItemTemplate={(x) => {
                        return (
                            <FriendItem friend={x} key={x.username}>
                                <Button variant='outline-success'>Принять</Button>
                            </FriendItem>
                        )
                    }}
                    friendListUrlBuilder={(len) => `user/@current/friends/incoming?start=${len}`}
                />
            </Tab>
            <Tab title='Исходящие заявки' eventKey='outgoing-list' className="p-2">
                <FriendsList 
                    friendItemTemplate={(x) => {
                        return (
                            <FriendItem friend={x} key={x.username}>
                                <Button variant='outline-danger'>Отменить</Button>
                            </FriendItem>
                        )
                    }}
                    friendListUrlBuilder={(len) => `user/@current/friends/outgoing?start=${len}`}
                />
            </Tab>
        </Tabs>
    );
};

export default MyFriendsPage;
