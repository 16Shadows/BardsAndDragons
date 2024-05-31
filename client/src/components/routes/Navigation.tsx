export function getLoginPageRoute() {
    return "/login";
}

export function getFriendsPageRoute() {
    return "/my-friends";
}

export function getUserProfileRoute(username: string) {
    return `/${username}`;
}

export function getPlayersPageRoute() {
    return "/players";
}