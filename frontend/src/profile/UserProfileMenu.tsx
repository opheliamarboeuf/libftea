import "./UserProfileMenu.css";
import { FaEllipsisV } from "react-icons/fa";
import { useUserProfileMenu } from "./hooks/useUserProfileMenu";



export function UserProfileMenu (){

	const {
		menuRef,
		toggleMenu,
		openMenu,
		handleBlock,
		handleReport,
	} = useUserProfileMenu();

	return (
			<div className="profile-menu" ref={menuRef}>
				<FaEllipsisV onClick={() => toggleMenu()} />
				{openMenu && (<div className="menu-dropdown">						
					<button onClick={() => handleBlock}>Block</button>
					<button onClick={() => handleReport}>Report</button>
				</div>)}
			</div>
		)
	}

