import { useQuery } from "@apollo/client";
import { Col, Layout, Row } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Dayjs } from "dayjs";
import { ErrorBanner, PageSkeleton } from "../../lib/components";
import { LISTING } from "../../lib/graphql/queries";
import {
	Listing as ListingData,
	ListingVariables,
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import {
	ListingBookings,
	ListingCreateBooking,
	ListingCreateBookingModal,
	ListingDetails,
} from "./components";
import { Viewer } from "../../lib/types";

interface Props {
	viewer: Viewer;
}

const PAGE_LIMIT = 3;
const { Content } = Layout;

export const Listing = ({ viewer }: Props) => {
	const { id } = useParams();
	const [bookingsPage, setBookingsPage] = useState(1);
	const [checkInDate, setCheckInDate] = useState<Dayjs | null>(null);
	const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(null);
	const [modalVisible, setModalVisible] = useState<boolean>(false);
	const { loading, data, error, refetch } = useQuery<
		ListingData,
		ListingVariables
	>(LISTING, {
		variables: {
			id: id || "",
			bookingsPage,
			limit: PAGE_LIMIT,
		},
	});

	const clearBookingData = () => {
		setModalVisible(false);
		setCheckInDate(null);
		setCheckOutDate(null);
	};

	const handleListingRefetch = async () => {
		await refetch();
	};

	if (loading) {
		return (
			<Content className="listings">
				<PageSkeleton />
			</Content>
		);
	}

	if (error) {
		return (
			<Content className="listings">
				<ErrorBanner description="This listing may not exist or we've encountered an error. Please try again soon!" />
				<PageSkeleton />
			</Content>
		);
	}

	const listing = data ? data.listing : null;
	const listingBookings = listing ? listing.bookings : null;
	const listingDetailsElement = listing ? (
		<ListingDetails listing={listing} />
	) : null;
	const listingBookingsElement = listingBookings ? (
		<ListingBookings
			listingBookings={listingBookings}
			bookingsPage={bookingsPage}
			limit={PAGE_LIMIT}
			setBookingsPage={setBookingsPage}
		/>
	) : null;

	const listingCreateBookingElement = listing ? (
		<ListingCreateBooking
			viewer={viewer}
			host={listing.host}
			price={listing.price}
			bookingsIndex={listing.bookingsIndex}
			checkInDate={checkInDate}
			setCheckInDate={setCheckInDate}
			checkOutDate={checkOutDate}
			setCheckOutDate={setCheckOutDate}
			setModalVisible={setModalVisible}
		/>
	) : null;

	const listingCreateBookingModalElement =
		listing && checkInDate && checkOutDate && id ? (
			<ListingCreateBookingModal
				id={id}
				price={listing.price}
				checkInDate={checkInDate}
				checkOutDate={checkOutDate}
				modalVisible={modalVisible}
				clearBookingData={clearBookingData}
				handleListingRefetch={handleListingRefetch}
				setModalVisible={setModalVisible}
			/>
		) : null;

	return (
		<Content className="listings">
			<Row gutter={24} justify="space-between">
				<Col xs={24} lg={14}>
					{listingDetailsElement}
					{listingBookingsElement}
				</Col>
				<Col xs={24} lg={10}>
					{listingCreateBookingElement}
				</Col>
			</Row>
			{listingCreateBookingModalElement}
		</Content>
	);
};
