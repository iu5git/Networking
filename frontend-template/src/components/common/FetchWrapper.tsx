import React, { useEffect } from 'react';

import { useQuery, UseQueryOptions } from 'react-query';
import { toast } from 'react-toastify';

type Props<T> = {
    queryKey: string;
    fetchFn: () => Promise<T>;
    render: React.FC<{ data: T; isFetching: boolean }>;
    emptyEl?: React.ReactElement | null;
    queryOptions?: Omit<
        UseQueryOptions<T, unknown, T, string>,
        'queryKey' | 'queryFn'
    >;
};

const FetchWrapper = <T,>({
    queryKey,
    fetchFn,
    render: Render,
    emptyEl = null,
    queryOptions,
}: Props<T>) => {
    const { isFetching, error, data } = useQuery(
        queryKey,
        fetchFn,
        queryOptions
    );

    useEffect(() => {
        if (!isFetching && error) toast.error(`${error}`);
    }, [isFetching]);

    return data ? <Render data={data} isFetching={isFetching} /> : emptyEl;
};

export default FetchWrapper;
