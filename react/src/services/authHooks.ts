import localStore from "../data/localStore.ts";
import AuthServices from "./authServices.ts";
import {useMutation, useQuery} from "@tanstack/react-query";

export function useLogout() {

    function logout() {
        localStore.clearSessionData()
    }

    return logout;
}


export function useLogin() {
    async function login(data: { username: string, password: string }) {
        const resp = await AuthServices.attemptLogin(data);
        localStore.setSessionData(resp.data);
        return resp;
    }

    return useMutation({
        mutationFn: login,
    });
}

export function useAuthStatus(checkServer: boolean = true) {
    async function checkIsAuthenticated() {
        const hasLocalSessionData = localStore.getSessionData() != null
        if (!checkServer) return hasLocalSessionData;

        return AuthServices.validateSession()
    }

    const query = useQuery({
        queryKey: ["session_validity"],
        queryFn: checkIsAuthenticated,
    })

    return {isAuthenticated: query.isSuccess && query.data, ...query}
}

