import { useLazyGetLaunches } from '../../api/hooks';

const Launches = () => {
    const {
        getLaunches,
        loading,
        launches,
        error,
        totalCount
    } = useLazyGetLaunches();

    return <div />;
}

export default Launches;