import {useCallback} from "react";
import {getHomeRoute} from "../components/routes/Navigation";
import {useLocation, useNavigate} from "react-router-dom";
import useSignInReact from "react-auth-kit/hooks/useSignIn";
import {UserData} from "../models/UserData";

/**
 * Sign in user. Call the react-auth-kit hook to store the user data. Then navigate to the home page.
 */
const useSignIn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const signInReact = useSignInReact<UserData>();

    return useCallback((token: string, userState: UserData): boolean => {
        if (!token || !userState) return false;

        if (signInReact({
            auth: {
                token: token,
                type: "Bearer"
            },
            userState: userState
        })) {
            navigate(location?.state?.from || getHomeRoute(), {replace: true});
            return true;
        } else {
            return false;
        }
    }, [signInReact, navigate, location]);
};

export default useSignIn;