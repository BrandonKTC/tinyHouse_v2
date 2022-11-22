import { Button, Card, DatePicker, Divider, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
	displayErrorMessage,
	formatListingPrice,
} from "../../../../lib/components";

const { Paragraph, Title } = Typography;

interface Props {
	price: number;
	checkInDate: Dayjs | null;
	checkOutDate: Dayjs | null;
	setCheckInDate: (checkInDate: Dayjs | null) => void;
	setCheckOutDate: (checkOutDate: Dayjs | null) => void;
}

export const ListingCreateBooking = ({
	price,
	checkInDate,
	checkOutDate,
	setCheckInDate,
	setCheckOutDate,
}: Props) => {
	const disabledDate = (currentDate: Dayjs) => {
		if (currentDate) {
			const dateIsBeforeEndOfDay = currentDate.isBefore(dayjs());
			return dateIsBeforeEndOfDay;
		} else return false;
	};

	const verifyAndSetCheckoutDate = (selectedCheckoutDate: Dayjs | null) => {
		if (checkInDate && selectedCheckoutDate) {
			if (!dayjs(selectedCheckoutDate).isAfter(checkInDate, "days")) {
				return displayErrorMessage(
					`You can't book date of check out to be prior to check in!`
				);
			}
		}
		setCheckOutDate(selectedCheckoutDate);
	};

	const checkOutInputDisabled = !checkInDate;
	const buttonDisabled = !checkInDate || !checkOutDate;

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
				>
					Request to book!
				</Button>
			</Card>
		</div>
	);
};
