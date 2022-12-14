import { Card, List, Skeleton } from "antd";
import listingLoadingCardCover from "../../assets/listing-loading-card-cover.jpg";

export const ListingsSkeleton = () => {
	const emptyData = [{}, {}, {}, {}, {}, {}, {}, {}];
	return (
		<div className="listings-skeleton">
			<Skeleton paragraph={{ rows: 1 }} />
			<List
				grid={{ gutter: 8, column: 4, xs: 1, sm: 2, lg: 4 }}
				dataSource={emptyData}
				renderItem={() => (
					<List.Item>
						<Card
							cover={
								<div
									style={{ backgroundImage: `url(${listingLoadingCardCover})` }}
									className="listings-skeleton__card-cover-img"
								/>
							}
							loading
						/>
					</List.Item>
				)}
			/>
		</div>
	);
};
