import { Button, Empty, Layout, Typography } from "antd";
import { Link } from "react-router-dom";

const { Content } = Layout;
const { Text } = Typography;

export const NotFound = () => {
	return (
		<Content className="not-found">
			<Empty
				description={
					<>
						<Text className="not-found__description-title">
							Uh oh! Something went wrong :(
						</Text>
						<Text className="not-found__description-subtitle">
							The page you're looking for can't be found
						</Text>
					</>
				}
			/>
			<Link to="/listings" className="not-found__cta">
				<Button className="ant-btn ant-btn-primary ant-btn-lg">
					View Listings
				</Button>
			</Link>
		</Content>
	);
};
