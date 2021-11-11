import { useLazyQuery } from '@apollo/client';
import { GET_LAUNCHES } from '../../api/queries';

import Launches from './Launches';

const LaunchesContainer = () => {
    const [getLaunches, { loading, data, error }] = useLazyQuery(GET_LAUNCHES, {
        fetchPolicy: "network-only",
        nextFetchPolicy: "cache-first"
    });

    const launches = data?.launchesPastResult?.data;
    const totalCount = data?.launchesPastResult?.result?.totalCount ?? 0;
    const handleGetLaunches = (offset, limit, mission_name) => {
        getLaunches({
            variables: {
                limit,
                offset,
                find: mission_name ? { mission_name } : {}
            },
        });
    };

    return (
        <Launches
            getLaunches={handleGetLaunches}
            loading={loading}
            launches={launches}
            totalCount={totalCount}
            error={error}
        />
    );
};

export default LaunchesContainer;