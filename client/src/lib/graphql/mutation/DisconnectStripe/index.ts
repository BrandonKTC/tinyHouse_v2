import { gql } from "@apollo/client";

export const DISCONNECT_STRIPE = gql`
	mutation disconnectStripe {
		disconnectStripe {
			hasWallet
		}
	}
`;
