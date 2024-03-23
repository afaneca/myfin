import React, { ReactNode, createContext, useContext, useState } from 'react';
import BackdropLoading from '../components/BackdropLoading';

interface LoadingContextType {
    isLoading: boolean;
    showLoading: () => void;
    hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
    isLoading: false, showLoading: () => { },
    hideLoading: () => { }
});

export const useLoading = () => {
    return useContext(LoadingContext);
}

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setLoading] = useState(false);

    const showLoading = () => setLoading(true);
    const hideLoading = () => setLoading(false);

    const value = { isLoading, showLoading, hideLoading };

    return (
        <LoadingContext.Provider value={value}>
            {children}
            <BackdropLoading />
        </LoadingContext.Provider>
    );
}