import { Card, Col, Input, Row, Typography } from "antd";
import torontoImage from "../../assets/toronto.jpg";
import dubaiImage from "../../assets/dubai.jpg";
import losAngelesImage from "../../assets/los-angeles.jpg";
import londonImage from "../../assets/london.jpg";
import { Link } from "react-router-dom";

interface Props {
	onSearch: (value: string) => void;
}

const { Title } = Typography;
const { Search } = Input;

export const HomeHero = ({ onSearch }: Props) => {
	return (
		<div className="home-hero">
			<div className="home-hero__search">
				<Title className="home-hero__title">
					Find a place you'll love to stay at
				</Title>
				<Search
					onSearch={onSearch}
					placeholder="Search 'San Francisco'"
					size="large"
					enterButton
					className="home-hero__search-input"
				></Search>
			</div>
			<Row gutter={12} className="home-hero__cards">
				<Col xs={12} md={6}>
					<Link to="/listings/toronto">
						<Card cover={<img src={torontoImage} alt="hero-cards" />}>
							Toronto
						</Card>
					</Link>
				</Col>
				<Col xs={12} md={6}>
					<Link to="/listings/dubai">
						<Card cover={<img src={dubaiImage} alt="hero-cards" />}>Dubai</Card>
					</Link>
				</Col>
				<Col xs={0} md={6}>
					<Link to="/listings/los%20angeles">
						<Card cover={<img src={losAngelesImage} alt="hero-cards" />}>
							Los Angeles
						</Card>
					</Link>
				</Col>
				<Col xs={0} md={6}>
					<Link to="/listings/london">
						<Card cover={<img src={londonImage} alt="hero-cards" />}>
							London
						</Card>
					</Link>
				</Col>
			</Row>
		</div>
	);
};
