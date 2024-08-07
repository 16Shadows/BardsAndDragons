import { Button, Tab, Tabs } from "react-bootstrap";
import FriendsList from "./FriendsList";
import FriendItem from "./FriendItem";
import { useCallback, useState } from "react";
import useApi from "../../http-common";
import FriendData from "./FriendData";

function FriendButtons({friend}: {friend: FriendData}) {
    const api = useApi();
    const [justDeleted, setJustDeleted] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const addFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${friend.username}/addFriend`);
            setJustDeleted(false);
            setDisabled(false);
        }
        catch {}
    }, [api, friend]);

    const deleteFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${friend.username}/removeFriend`);
            setJustDeleted(true);
            setDisabled(false);
        }
        catch {}
    }, [api, friend]);

    if (justDeleted)
        return (
            <Button disabled={disabled} onClick={addFriend} variant='outline-success'>
                Принять
            </Button>
        );
    else
        return (
            <Button disabled={disabled} onClick={deleteFriend} variant='outline-danger'>
                Удалить
            </Button>
        );
}

function IncomingRequestButtons({friend}: {friend: FriendData}) {
    const api = useApi();
    const [justDeleted, setJustDeleted] = useState(true);

    const [disabled, setDisabled] = useState(false);

    const addFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${friend.username}/addFriend`);
            setJustDeleted(false);
            setDisabled(false);
        }
        catch {}
    }, [api, friend]);

    const deleteFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${friend.username}/removeFriend`);
            setJustDeleted(true);
            setDisabled(false);
        }
        catch {}
    }, [api, friend]);

    if (justDeleted)
        return (
            <Button disabled={disabled} onClick={addFriend} variant='outline-success'>
                Принять
            </Button>
        );
    else
        return (
            <Button disabled={disabled} onClick={deleteFriend} variant='outline-danger'>
                Удалить
            </Button>
        );
}

function OutgoingRequestButtons({friend}: {friend: FriendData}) {
    const api = useApi();
    const [justDeleted, setJustDeleted] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const addFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${friend.username}/addFriend`);
            setJustDeleted(false);
            setDisabled(false);
        }
        catch {}
    }, [api, friend]);

    const deleteFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${friend.username}/removeFriend`);
            setJustDeleted(true);
            setDisabled(false);
        }
        catch {}
    }, [api, friend]);

    if (justDeleted)
        return (
            <Button disabled={disabled} onClick={addFriend} variant='outline-success'>
                Отправить
            </Button>
        );
    else
        return (
            <Button disabled={disabled} onClick={deleteFriend} variant='outline-danger'>
                Отозвать
            </Button>
        );
}

function MyFriendsPage() {
    return (
        <Tabs>
            <Tab title='Мои друзья' eventKey='friends-list' className="p-2">
                <FriendsList 
                    friendItemTemplate={(x) => {
                        return (
                            <FriendItem friend={x} key={x.username}>
                                <FriendButtons friend={x} />
                            </FriendItem>
                        )
                    }}
                    friendListUrlBuilder={(len, sortBy, sortOrder) => `user/@current/friends/current?start=${len}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                />
            </Tab>
            <Tab title='Входящие заявки' eventKey='incoming-list' className="p-2">
                <FriendsList 
                    friendItemTemplate={(x) => {
                        return (
                            <FriendItem friend={x} key={x.username}>
                                <IncomingRequestButtons friend={x} />
                            </FriendItem>
                        )
                    }}
                    friendListUrlBuilder={(len, sortBy, sortOrder) => `user/@current/friends/incoming?start=${len}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                />
            </Tab>
            <Tab title='Исходящие заявки' eventKey='outgoing-list' className="p-2">
                <FriendsList 
                    friendItemTemplate={(x) => {
                        return (
                            <FriendItem friend={x} key={x.username}>
                                <OutgoingRequestButtons friend={x} />
                            </FriendItem>
                        )
                    }}
                    friendListUrlBuilder={(len, sortBy, sortOrder) => `user/@current/friends/outgoing?start=${len}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                />
            </Tab>
        </Tabs>
    );
};

export default MyFriendsPage;
