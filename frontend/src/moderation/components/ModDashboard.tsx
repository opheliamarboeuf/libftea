import { PostReportList } from "./PostReportList";
import { Post } from "../../context/UserContext";
import { useState, useEffect } from "react";
import { moderationApi } from "../api";

export function ModDashboard (){
	
	const [posts, setPosts] = useState<Post[]>([]);
	
		const loadPosts = async () => {
			const data =  await moderationApi.fetchPendingPostReport();
			setPosts(data);
		}
	
		useEffect(() => {
			loadPosts();
		}, []);
		

	return (
		<div className="">
			<PostReportList posts = {posts}/>
		</div>
	)
}