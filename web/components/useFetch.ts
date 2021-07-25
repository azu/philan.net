import { useCallback, useEffect, useState } from "react";

export function useFetch<T>(input: RequestInfo, init?: RequestInit) {
    const [response, setResponse] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<null | Error>(null);

    useEffect(() => {
        const abortController = new AbortController();
        const fetchData = async () => {
            try {
                const res = await fetch(input, {
                    ...init,
                    signal: abortController.signal
                });
                const json = await res.json();
                setResponse(json);
            } catch (error) {
                setError(error);
            }
        };
        setIsLoading(true);
        fetchData().finally(() => {
            setIsLoading(false);
        });
        return () => {
            setIsLoading(false);
            abortController.abort();
        };
    }, [init, input]);

    const reload = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(input, init);
            const json = await res.json();
            setResponse(json);
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }, [init, input]);
    return [{ response, error, isLoading }, { reload }] as const;
}
