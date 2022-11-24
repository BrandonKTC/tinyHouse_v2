import { useMutation } from "@apollo/client";
import { Layout, Spin } from "antd";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { displaySuccessNotification } from "../../lib/components";
import { CONNECT_STRIPE } from "../../lib/graphql/mutation";
import {
	ConnectStripe as ConnectStripeData,
	ConnectStripeVariables,
} from "../../lib/graphql/mutation/ConnectStripe/__generated__/ConnectStripe";
import { Viewer } from "../../lib/types";

const { Content } = Layout;

interface Props {
	viewer: Viewer;
	setViewer: (viewer: Viewer) => void;
}

export const Stripe = ({ viewer, setViewer }: Props) => {
	const navigate = useNavigate();
	const [connectStripe, { data, loading, error }] = useMutation<
		ConnectStripeData,
		ConnectStripeVariables
	>(CONNECT_STRIPE, {
		onCompleted: (data) => {
			if (data && data.connectStripe) {
				setViewer({ ...viewer, hasWallet: data.connectStripe.hasWallet });
				displaySuccessNotification(
					"You've succesfully connected your stripe Account!",
					"You can now begin to create listings in the Host page."
				);
			}
		},
	});
	const connectStripeRef = useRef(connectStripe);

	useEffect(() => {
		const code = new URL(window.location.href).searchParams.get("code");
		if (code) {
			connectStripeRef.current({
				variables: {
					input: { code },
				},
			});
		} else {
			navigate(`/user/${viewer.id}`);
		}
	}, [viewer.id, navigate]);

	if (data && data.connectStripe) {
		console.log(data);
		navigate(`/user/${viewer.id}`);
	}
	if (loading) {
		return (
			<Content className="stripe">
				<Spin size="large" tip="Connecting your Stripe account..." />
			</Content>
		);
	}
	if (error) {
		navigate(`/user/${viewer.id}?stripe_error=true`);
	}

	return null;
};
