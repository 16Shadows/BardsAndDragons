import useSignOutReact from "react-auth-kit/hooks/useSignOut";
import useApi from "../http-common";
import {useNavigate} from "react-router-dom";

/**
 * Sign out the user. Call the API to invalidate the token. Call the react-auth-kit hook to delete all the auth state
 */
const useSignOut = () => {
    const api = useApi();
    const signOutReact = useSignOutReact();
    const navigate = useNavigate();
    const signOut = () => {
        api.post("user/logout", {})
            .catch(() => {})
            .finally(() => signOutReact())
            .finally(() => navigate("/"));
    }
    return {signOut};
};

export default useSignOut;