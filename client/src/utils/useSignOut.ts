import useSignOutReact from "react-auth-kit/hooks/useSignOut";
import {useNavigate} from "react-router-dom";
import {useCallback} from "react";
import {getHomeRoute} from "../components/routes/Navigation";

/**
 * Sign out the user. First, call signOutStrategy, then call the react-auth-kit hook to delete all the auth state.
 */
const useSignOut = (signOutStrategy: () => Promise<boolean>) => {
    const signOutReact = useSignOutReact();
    const navigate = useNavigate();

    return useCallback(async () => {
        if (await signOutStrategy()) {
            signOutReact();
            navigate(getHomeRoute());
        }
    }, [signOutReact, navigate, signOutStrategy]);
};

export default useSignOut;