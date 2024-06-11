import useSignOutReact from "react-auth-kit/hooks/useSignOut";
import {useNavigate} from "react-router-dom";
import { useCallback } from "react";

/**
 * Sign out the user. Call the API to invalidate the token. Call the react-auth-kit hook to delete all the auth state
 */
const useSignOut = (signOutStrategy: () => Promise<boolean>) => {
    const signOutReact = useSignOutReact();
    const navigate = useNavigate();
    const signOut = useCallback(async () => {
        if (await signOutStrategy())
        {
            signOutReact();
            navigate("/");
        }
    }, [signOutReact, navigate, signOutStrategy]);
    return signOut;
};

export default useSignOut;