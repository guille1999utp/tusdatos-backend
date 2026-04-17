import { columnsEvents } from "@/modules/app/events/adapters/EventColumns";
import {
  deleteEvents,
  getMyEvents,
} from "@/redux/features/events/events.thunks";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useCallback, useMemo, useState } from "react";
import useDialogState from "./useDialogState";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/lib/useDebounce";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

export const useTableListEvents = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [regOpen, setRegOpen] = useState<{ open: boolean; id: number }>({
    open: false,
    id: 0,
  });

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const filters = useMemo(
    () => ({
      skip: String(page * PAGE_SIZE),
      limit: String(PAGE_SIZE),
      ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
    }),
    [page, debouncedSearch],
  );

  const {
    listMyEvents,
    isLoadingGetEvents,
    isLoadingDeleteEvents,
    totalMyEvents,
  } = useAppSelector((state) => state.events);

  const onMounted = useCallback(async () => {
    await dispatch(getMyEvents({ filters }));
  }, [dispatch, filters]);

  useEffect(() => {
    onMounted();
  }, [onMounted]);

  const handleDelete = async (id: number) => {
    const respDispatch = await dispatch(deleteEvents({ params: { id } }));

    if (respDispatch.meta.requestStatus === "fulfilled") {
      toast.success("Evento eliminado correctamente");
      await onMounted();
    }
    handleCloseDialogConfirmDelete();
  };

  const {
    openDialogEvents,
    currentEventsState,
    dialogConfirmDelete,
    setOpenDialogEvents,
    setDialogConfirmDelete,
    handleCloseEventsDialog,
    handleOpenConfirmDelete,
    handleCloseDialogConfirmDelete,
    handleOpenDialogAndSetCurrentEvents,
    setCurrentEventsState,
    handleCloseAssignUser,
    handleOpenAssignUser,
    openDialogAssignUser,
  } = useDialogState();

  const columns = columnsEvents(
    handleOpenDialogAndSetCurrentEvents,
    handleOpenConfirmDelete,
    handleOpenAssignUser,
    {
      globalRole: user?.role ?? "usuario",
      onManageSessions: (eventId: number) => navigate(`/events/${eventId}`),
      ...(user?.role === "admin"
        ? {
            onRegistrations: (eventId: number) =>
              setRegOpen({ open: true, id: eventId }),
          }
        : {}),
    },
  );

  return {
    columns,
    onMounted,
    listMyEvents,
    isLoadingGetEvents,
    openDialogEvents,
    currentEventsState,
    dialogConfirmDelete,
    setOpenDialogEvents,
    setDialogConfirmDelete,
    handleCloseEventsDialog,
    handleOpenConfirmDelete,
    handleCloseDialogConfirmDelete,
    setCurrentEventsState,
    handleDelete,
    isLoadingDeleteEvents,
    openDialogAssignUser,
    handleOpenAssignUser,
    handleCloseAssignUser,
    page,
    setPage,
    search,
    setSearch,
    totalMyEvents,
    pageSize: PAGE_SIZE,
    regOpen,
    setRegOpen,
  };
};
