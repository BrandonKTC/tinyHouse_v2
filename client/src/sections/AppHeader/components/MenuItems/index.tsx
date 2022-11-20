import { Button, Menu, Avatar } from "antd";
import { HomeOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOG_OUT } from "../../../../lib/graphql/mutation";
import { LogOut as LogOutData } from "../../../../lib/graphql/mutation/Logout/__generated__/LogOut";
import { Viewer } from "../../../../lib/types";
import {
	displayErrorMessage,
	displaySuccessNotification,
} from "../../../../lib/components";

interface Props {
	viewer: Viewer;
	setViewer: (viewer: Viewer) => void;
}

export const MenuItems = ({ viewer, setViewer }: Props) => {
	const [logOut] = useMutation<LogOutData>(LOG_OUT, {
		onCompleted: (data) => {
			if (data && data.logOut) {
				setViewer(data.logOut);
				sessionStorage.removeItem("token");
				displaySuccessNotification("You've successfully logged out!");
			}
		},
		onError: (data) => {
			displayErrorMessage(
				"Sorry! We weren't able to log you out. Please try again later!"
			);
		},
	});

	const handleLogOut = () => {
		logOut();
	};

	const menuItems = [
		{
			key: "host",
			icon: (
				<Link to="/host">
					<HomeOutlined />
				</Link>
			),
			label: "host",
		},
		viewer.avatar
			? {
					key: "/avatar",
					icon: <Avatar src={viewer.avatar} className="menu-avatar" />,
					children: [
						{
							key: "/user",
							icon: (
								<Link to={`/user/${viewer.id}`}>
									<UserOutlined />
								</Link>
							),
							label: "Profile",
						},
						{
							key: "/logout",
							icon: (
								<div onClick={handleLogOut}>
									<LogoutOutlined /> <span> Log out</span>
								</div>
							),
						},
					],
			  }
			: {
					key: "/login",
					label: (
						<Link to="/login">
							<Button type="primary">Sign In</Button>
						</Link>
					),
			  },
	];
	return (
		<Menu
			items={menuItems}
			mode="horizontal"
			selectable={false}
			className="menu"
		/>
	);
};
