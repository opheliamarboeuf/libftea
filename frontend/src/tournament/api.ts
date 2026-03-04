// tournament/api.ts
// helpers for interacting with the backend's tournament endpoints.

const API_URL = "http://localhost:3000";

export const tournamentApi = {
    joinTournament: async (
        battleId: number,
        payload: FormData
    ): Promise<any> => {
        const res = await fetch(`${API_URL}/tournament/${battleId}/join`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: payload,
        });
        const data = await res.json();
        if (!res.ok) {
            const message = Array.isArray(data.message)
                ? data.message[0]
                : data.message || "Tournament join failed";
            throw new Error(message);
        }
        return data;
    },

    createTournament: async (payload: FormData): Promise<any> => {
        const res = await fetch(`${API_URL}/tournament`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: payload,
        });
        const data = await res.json();
        if (!res.ok) {
            const message = Array.isArray(data.message)
                ? data.message[0]
                : data.message || "Tournament creation failed";
            throw new Error(message);
        }
        return data;
    },

    getCurrentTournament: async (): Promise<any> => {
        const res = await fetch(`${API_URL}/tournament/current`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        const data = await res.json();
        if (!res.ok) {
            const message = Array.isArray(data.message)
                ? data.message[0]
                : data.message || "Fetch current tournament failed";
            throw new Error(message);
        }
        return data;
    },
};
