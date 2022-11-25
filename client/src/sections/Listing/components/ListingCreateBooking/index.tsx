import { Button, Card, DatePicker, Divider, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
	displayErrorMessage,
	formatListingPrice,
} from "../../../../lib/components";
import { Listing as ListingData } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";
import { Viewer } from "../../../../lib/types";
import { BookingsIndex } from "./types";

const { Paragraph, Title, Text } = Typography;

interface Props {
	price: number;
	viewer: Viewer;
	bookingsIndex: ListingData["listing"]["bookingsIndex"];
	checkInDate: Dayjs | null;
	checkOutDate: Dayjs | null;
	host: ListingData["listing"]["host"];
	setModalVisible: (modalVisible: boolean) => void;
	setCheckInDate: (checkInDate: Dayjs | null) => void;
	setCheckOutDate: (checkOutDate: Dayjs | null) => void;
}

export const ListingCreateBooking = ({
	host,
	price,
	viewer,
	checkInDate,
	checkOutDate,
	bookingsIndex,
	setCheckInDate,
	setModalVisible,
	setCheckOutDate,
}: Props) => {
	const bookingsIndexJSON: BookingsIndex = JSON.parse(bookingsIndex);

	const dateIsBooked = (currentDate: Dayjs) => {
		const year = dayjs(currentDate).year();
		const month = dayjs(currentDate).month();
		const day = dayjs(currentDate).date();

		if (bookingsIndexJSON[year] && bookingsIndexJSON[year][month]) {
			return Boolean(bookingsIndexJSON[month][day]);
		}

		return false;
	};

	const disabledDate = (currentDate: Dayjs) => {
		if (currentDate) {
			const dateIsBeforeEndOfDay = currentDate.isBefore(dayjs());
			return dateIsBeforeEndOfDay || dateIsBooked(currentDate);
		} else return false;
	};

	const verifyAndSetCheckoutDate = (selectedCheckoutDate: Dayjs | null) => {
		if (checkInDate && selectedCheckoutDate) {
			if (!dayjs(selectedCheckoutDate).isAfter(checkInDate, "days")) {
				return displayErrorMessage(
					`You can't book date of check out to be prior to check in!`
				);
			}

			let dateCursor = checkInDate;

			while (dayjs(dateCursor).isBefore(selectedCheckoutDate, "days")) {
				dateCursor = dayjs(dateCursor).add(1, "days");

				const year = dayjs(dateCursor).year();
				const month = dayjs(dateCursor).month();
				const day = dayjs(dateCursor).date();

				if (
					bookingsIndexJSON[year] &&
					bookingsIndexJSON[year][month] &&
					bookingsIndexJSON[month][day]
				) {
					return displayErrorMessage(
						"You can't book book a period of time that overlaps existing booking. Please try again!"
					);
				}
			}
		}
		setCheckOutDate(selectedCheckoutDate);
	};

	const viewerIsHost = viewer.id === host.id;
	const checkInInputDisabled = !viewer.id || viewerIsHost || !host.hasWallet;
	const checkOutInputDisabled = checkInInputDisabled || !checkInDate;
	const buttonDisabled = checkInInputDisabled || !checkInDate || !checkOutDate;

	let buttonMessage = '" You won\'t be charged yet "';
	if (!viewer.id)
		buttonMessage = '" You have to be signed in to book a listing! "';
	else if (viewerIsHost)
		buttonMessage = '" You can\'t book your own listing! "';
	else if (!host.hasWallet)
		buttonMessage =
			'" The host has disconnected from Stripe and thus won\'t be able to receive payments! "';

	return (
		<div className="listing-booking">
			<Card className="listing-booking__card">
				<div className="">
					<Paragraph>
						<Title level={2} className="listing-booking_card-title">
							{formatListingPrice(price)}
							<span style={{ color: "lightgrey" }}>/day</span>
						</Title>
					</Paragraph>
					<Divider />
					<div className="listing-booking__card-date-picker">
						<Paragraph strong>Check In</Paragraph>
						<DatePicker
							value={checkInDate}
							showToday={false}
							disabled={checkInInputDisabled}
							format={"DD/MM/YYYY"}
							disabledDate={disabledDate}
							onOpenChange={() => setCheckOutDate(null)}
							onChange={(dateValue) => setCheckInDate(dateValue)}
						/>
					</div>
					<div className="listing-booking__card-date-picker">
						<Paragraph strong>Check Out</Paragraph>
						<DatePicker
							value={checkOutDate}
							showToday={false}
							format={"DD/MM/YYYY"}
							disabledDate={disabledDate}
							disabled={checkOutInputDisabled}
							onChange={(dateValue) => verifyAndSetCheckoutDate(dateValue)}
						/>
					</div>
				</div>
				<Divider />
				<Button
					disabled={buttonDisabled}
					size="large"
					type="primary"
					className="listing-booking__card-cta"
					onClick={() => setModalVisible(true)}
				>
					Request to book!
				</Button>
				<Text type="secondary" mark>
					{buttonMessage}
				</Text>
			</Card>
		</div>
	);
};
