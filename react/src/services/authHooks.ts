import localStore from "../data/localStore.ts";
import { queryClient } from "../data/react-query.ts";
import AuthServices from "./authServices.ts";
import { useMutation, useQuery } from "@tanstack/react-query";

const QUERY_KEY_SESSION_VALIDITY = "session_validity"

export function useLogout() {

    function logout() {
        localStore.clearSessionData()
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY_SESSION_VALIDITY] })
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
        if (!hasLocalSessionData || !checkServer) return hasLocalSessionData;
        return AuthServices.validateSession()
    }

    const query = useQuery({
        queryKey: [QUERY_KEY_SESSION_VALIDITY],
        queryFn: checkIsAuthenticated,
    })

    return { isAuthenticated: query.isSuccess && query.data, ...query }
}

