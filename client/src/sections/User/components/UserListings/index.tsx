import { List, Typography } from "antd";
import { ListingCard } from "../../../../lib/components";
import { User } from "../../../../lib/graphql/queries/User/__generated__/User";

interface Props {
	userListings: User["user"]["listings"];
	listingsPage: number;
	limit: number;
	setListingsPage: (page: number) => void;
}

const { Paragraph, Title } = Typography;

export const UserListings = ({
	userListings,
	listingsPage,
	limit,
	setListingsPage,
}: Props) => {
	const { total, result } = userListings;

	const userListingsList = (
		<List
			grid={{ gutter: 8, column: 4, xs: 1, sm: 2, lg: 4 }}
			dataSource={result}
			locale={{ emptyText: "User doesn't have any listings yet!" }}
			pagination={{
				position: "top",
				current: listingsPage,
				total,
				hideOnSinglePage: true,
				onChange: (page: number) => setListingsPage(page),
			}}
			renderItem={(userListings) => (
				<List.Item>
					<ListingCard listing={userListings} />
				</List.Item>
			)}
		/>
	);

	return (
		<div className="user-listings">
			<Title level={4} className="user-listings__title">
				Listings
			</Title>
			<Paragraph className="user-listings__description">
				This section highlights the listings this user currently hosts and has
				made available for bookings
			</Paragraph>
			{userListingsList}
		</div>
	);
};
