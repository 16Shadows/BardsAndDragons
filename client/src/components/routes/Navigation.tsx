export function getHomeRoute() {
    return "/";
}

export function getLoginPageRoute() {
    return "/login";
}

export function getRegistrationPageRoute() {
    return "/register";
}

export function getMyProfilePageRoute() {
    return "/my-profile";
}

export function getFriendsPageRoute() {
    return "/my-friends";
}

export function getMyGamesPageRoute() {
    return "/my-games";
}

export function getUserProfileRoute(username: string) {
    return `/profile/${username}`;
}

export function getGamePageRoute(gamename: string) {
    return `/${gamename}`;
}

export function getPlayersPageRoute() {
    return "/players";
}

export function getGamesPageRoute() {
    return "/games";
}

export function getNotFoundRoute() {
    return "*";
}