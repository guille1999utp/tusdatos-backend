import { getAllEvents } from "@/redux/features/events/events.thunks";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useCallback } from "react";

export const useTableAllListEvents = (filters: Record<string, string>) => {
    const dispatch = useAppDispatch();

    const { listEvents, isLoadingGetEvents, totalListEvents } = useAppSelector(
        (state) => state.events
    );

    const filtersKey = JSON.stringify(filters);

    const onMounted = useCallback(async () => {
        await dispatch(getAllEvents({ filters }));
    }, [dispatch, filtersKey]);

    useEffect(() => {
        onMounted();
    }, [onMounted]);

    return {
        onMounted,
        listEvents,
        isLoadingGetEvents,
        totalListEvents,
    };
};
