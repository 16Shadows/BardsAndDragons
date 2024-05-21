import useSignOutReact from "react-auth-kit/hooks/useSignOut";
import useApi from "../http-common";

/**
 * Sign out the user. Call the API to invalidate the token. Call the react-auth-kit hook to delete all the auth state
 */
const useSignOut = () => {
    const api = useApi();
    const signOutReact = useSignOutReact();
    const signOutApi = () => api.post("user/logout", {});
    const signOut = () => {
        signOutApi().then(() => signOutReact())//.catch();
    }
    return {signOut};
};

export default useSignOut;