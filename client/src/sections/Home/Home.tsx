import {
	Listings as ListingsData,
	ListingsVariables,
} from "../../lib/graphql/queries/Listings/__generated__/Listings";
import { Button, Layout, Typography, Col, Row } from "antd";
import { HomeHero, HomeListings, HomeListingsSkeleton } from "./components";
import mapBackground from "./assets/map-background.jpg";
import sanFransiscoImage from "./assets/san-fransisco.jpg";
import cancunImage from "./assets/cancun.jpg";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { LISTINGS } from "../../lib/graphql/queries";
import { ListingsFilter } from "../../lib/graphql/globalTypes";

const { Content } = Layout;
const { Paragraph, Title } = Typography;

const PAGE_NUMBER = 1;
const PAGE_LIMIT = 4;

export const Home = () => {
	const { loading, data } = useQuery<ListingsData, ListingsVariables>(
		LISTINGS,
		{
			variables: {
				filter: ListingsFilter.PRICE_HIGH_TO_LOW,
				limit: PAGE_LIMIT,
				page: PAGE_NUMBER,
			},
		}
	);

	const navigate = useNavigate();

	const onSearch = (value: string) => {
		const trimmedValue = value.trim();

		if (trimmedValue) {
			navigate(`/listings/${trimmedValue}`);
		} else {
			navigate("/listings/");
		}
	};

	const renderListingsSection = () => {
		if (loading) {
			return <HomeListingsSkeleton />;
		}

		if (data) {
			return (
				<HomeListings
					title="Premium Listings"
					listings={data.listings.result}
				/>
			);
		}

		return null;
	};
	return (
		<Content
			className="home"
			style={{ backgroundImage: `url(${mapBackground})` }}
		>
			<HomeHero onSearch={onSearch} />
			<div className="home__cta-section">
				<Title className="home__cta-section-title">
					Your guide for all tings rental
				</Title>
				<Paragraph>
					Helping you make the best decisions in renting your last minute
					locations.
				</Paragraph>
				<Link to="/listings/united%20states">
					<Button className="ant-btn-primary ant-btn-lg home__cta-section-button">
						Popular listings in the United States
					</Button>
				</Link>
			</div>

			{renderListingsSection()}

			<div className="home__listings">
				<Title level={4} className="home__listings-title">
					Listings of any kind
				</Title>
				<Row gutter={12}>
					<Col xs={24} sm={12}>
						<Link to="listings/san%20fransisco">
							<div className="home__listings-img-cover">
								<img
									src={sanFransiscoImage}
									alt="SanFransisco"
									className="home__listings-img"
								/>
							</div>
						</Link>
					</Col>
					<Col xs={24} sm={12}>
						<Link to="listings/cancun">
							<div className="home__listings-img-cover">
								<img
									src={cancunImage}
									alt="Cancun"
									className="home__listings-img"
								/>
							</div>
						</Link>
					</Col>
				</Row>
			</div>
		</Content>
	);
};
