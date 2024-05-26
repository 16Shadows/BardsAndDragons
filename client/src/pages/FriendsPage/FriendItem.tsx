import './FriendItem.css';
import { Link } from 'react-router-dom';
import NoAvatarImage from '../../resources/EmptyProfileAvatar_200px.png';
import FriendData from './FriendData';
import { getUserProfileRoute } from '../../components/routes/Navigation';
import { PropsWithChildren } from 'react';

export type FriendItemProps = {
    friend: FriendData;
};

function FriendItem(props: PropsWithChildren<FriendItemProps>) {
    return (
        <div className="friend-item align-items-center p-2 mb-2">
            <img src={props.friend.avatarPath ?? NoAvatarImage} alt='Avatar' className='friend-avatar me-2'/>
            <Link to={getUserProfileRoute(props.friend.username)} className='me-auto h-auto text-wrap'>
                {props.friend.displayName}
            </Link>
            {props.children}
        </div>
    );
}

export default FriendItem;