import { KeyOutlined } from "@ant-design/icons";
import { Modal, Button, Divider, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
	displayErrorMessage,
	displaySuccessNotification,
	formatListingPrice,
} from "../../../../lib/components";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation } from "@apollo/client";
import {
	CreateBooking as CreateBookingData,
	CreateBookingVariables,
} from "../../../../lib/graphql/mutation/CreateBooking/__generated__/createBooking";
import { CREATE_BOOKING } from "../../../../lib/graphql/mutation";

interface Props {
	id: string;
	price: number;
	modalVisible: boolean;
	checkInDate: Dayjs;
	checkOutDate: Dayjs;
	setModalVisible: (modalVisible: boolean) => void;
	clearBookingData: () => void;
	handleListingRefetch: () => Promise<void>;
}

const { Paragraph, Text, Title } = Typography;

export const ListingCreateBookingModal = ({
	id,
	price,
	modalVisible,
	checkInDate,
	checkOutDate,
	setModalVisible,
	clearBookingData,
	handleListingRefetch,
}: Props) => {
	const stripe = useStripe();
	const elements = useElements();

	const [createBooking, { loading }] = useMutation<
		CreateBookingData,
		CreateBookingVariables
	>(CREATE_BOOKING, {
		onCompleted: () => {
			clearBookingData();
			displaySuccessNotification(
				"You've successfully booked the listing!",
				"Booking history can always be found in your User page."
			);
			handleListingRefetch();
		},
		onError: (err) => {
			console.log(err);
			displayErrorMessage(
				"Sorry! We weren't able to successfully book the listing. Please try again later!"
			);
		},
	});

	const daysBooked = checkOutDate.diff(checkInDate, "days") + 1;
	const listingPrice = price * daysBooked;

	const handleCreateBooking = async () => {
		if (!stripe || !elements) {
			return displayErrorMessage(
				"Sorry! We weren't able to connect with Stripe"
			);
		}

		const cardElement = elements.getElement(CardElement);

		if (cardElement) {
			const { token: stripeToken, error } = await stripe.createToken(
				cardElement
			);

			if (stripeToken) {
				createBooking({
					variables: {
						input: {
							id: id,
							source: stripeToken.id,
							checkIn: dayjs(checkInDate).format("DD-MM-YYYY"),
							checkOut: dayjs(checkOutDate).format("DD-MM-YYYY"),
						},
					},
				});
			} else {
				displayErrorMessage(
					error?.message ??
						"Sorry! We weren't able to book the listing. Please try again later."
				);
			}
		}
	};

	return (
		<Modal
			visible={modalVisible}
			centered
			footer={null}
			onCancel={() => setModalVisible(false)}
		>
			<div className="listing-booking-modal">
				<div className="listing-booking-modal__intro">
					<Title className="listing-boooking-modal__intro-title">
						<KeyOutlined />
					</Title>
					<Title level={3} className="listing-boooking-modal__intro-title">
						Book your trip
					</Title>
					<Paragraph>
						Enter your payment information to book the listing from the dates
						between{" "}
						<Text mark strong>
							{dayjs(checkInDate).format("DD MMMM YYYY")}
						</Text>{" "}
						and{" "}
						<Text mark strong>
							{dayjs(checkOutDate).format("DD MMMM YYYY")}
						</Text>
						, inclusive.
					</Paragraph>
				</div>

				<Divider />

				<div className="listing-booking-modal__charge-summary">
					<Paragraph>
						{formatListingPrice(price, false)} * {daysBooked} days ={" "}
						<Text strong>{formatListingPrice(listingPrice, false)}</Text>
					</Paragraph>
					<Paragraph className="listing-booking-modal__charge-summary-total">
						Total = <Text mark>{formatListingPrice(listingPrice, false)}</Text>
					</Paragraph>
				</div>

				<Divider />

				<div className="listing-booking-modal__stripe-card-section">
					<CardElement
						className="listing-booking-modal__stripe-card"
						options={{ hidePostalCode: true }}
					/>
					<Button
						size="large"
						type="primary"
						className="listing-booking-modal__cta"
						onClick={handleCreateBooking}
						loading={loading}
						disabled={!stripe || !elements}
					>
						Book
					</Button>
				</div>
			</div>
		</Modal>
	);
};
