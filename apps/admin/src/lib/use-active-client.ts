import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useTRPC } from "~/lib/trpc";

const ACTIVE_CLIENT_STORAGE_KEY = "lylrv_admin_active_client";

export function useActiveClient() {
	const trpc = useTRPC();
	const clientsQuery = useQuery(trpc.dashboard.getClients.queryOptions());
	const clients = clientsQuery.data ?? [];

	const [activeClientId, setActiveClientId] = useState<string | undefined>(
		undefined,
	);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const persisted = localStorage.getItem(ACTIVE_CLIENT_STORAGE_KEY) ?? undefined;
		if (persisted) {
			setActiveClientId(persisted);
		}
	}, []);

	useEffect(() => {
		if (!clients.length) {
			return;
		}

		const hasActive =
			activeClientId && clients.some((client) => client.id === activeClientId);
		if (hasActive) {
			return;
		}

		setActiveClientId(clients[0]?.id);
	}, [activeClientId, clients]);

	const updateActiveClient = (clientId: string) => {
		setActiveClientId(clientId);
		if (typeof window !== "undefined") {
			localStorage.setItem(ACTIVE_CLIENT_STORAGE_KEY, clientId);
		}
	};

	const activeClient = clients.find((client) => client.id === activeClientId) ?? null;

	return {
		clients,
		activeClient,
		activeClientId,
		setActiveClientId: updateActiveClient,
		isLoadingClients: clientsQuery.isLoading,
	};
}
