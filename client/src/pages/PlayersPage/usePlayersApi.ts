import {PlayerData} from "./PlayerData";
import useApi from "../../http-common";

const usePlayersApi = () => {
    const api = useApi();
    const getMatches = (): Promise<PlayerData[]> => {
        return new Promise((resolve, reject) =>
            api.get('matching/get-players')
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error);
                }));
    };

    return {getMatches};
};

export default usePlayersApi;