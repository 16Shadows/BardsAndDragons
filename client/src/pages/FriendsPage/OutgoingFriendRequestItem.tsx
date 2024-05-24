import './OutgoingFriendRequestItem.css';
import { Link } from 'react-router-dom';
import NoAvatarImage from '../../resources/EmptyProfileAvatar_200px.png';
import { Button } from 'react-bootstrap';
import { getUserProfileRoute } from '../../components/routes/Navigation';

export type FriendData = {
    username: string;
    displayName?: string;
    avatarSource?: string;
};

export type FriendItemProps = {
    friend: FriendData;
};

function OutgoingFriendRequestItem(props: FriendItemProps) {
    return (
        <div className="outgoing-friend-request-item align-items-center p-2 mb-2">
            <img src={props.friend.avatarSource ?? NoAvatarImage} alt='Avatar' className='friend-avatar me-2'/>
            <Link to={getUserProfileRoute(props.friend.username)} className='me-auto h-auto text-wrap'>
                {props.friend.displayName ?? props.friend.username}
            </Link>
            <Button variant='outline-danger'>Отменить</Button>
        </div>
    );
}

export default OutgoingFriendRequestItem;