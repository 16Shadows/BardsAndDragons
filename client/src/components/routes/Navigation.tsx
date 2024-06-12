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
    return `/${username}`;
}

export function getPlayersPageRoute() {
    return "/players";
}

export function getGamesPageRoute() {
    return "/games";
}

export function getGamePageRoute(gamename: string) {
    return `/${gamename}`;
}

export function getNotFoundRoute() {
    return "*";
}