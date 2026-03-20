import { useEffect, useState } from "react";
import { userManagementApi } from "./api";
import { ModerationUser } from "./types";
import { UserList } from "./UserList";

export function AllAdmin() {

	const [users, setUsers] = useState<ModerationUser[]>([]);

	const load = async () => {
		const data = await userManagementApi.fetchAllAdmin();
		setUsers(data);
	};

	useEffect(() => {
		load();
	}, []);

	return <UserList users={users} onUpdate={load} />;
}