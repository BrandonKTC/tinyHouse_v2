import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`, {
	apiVersion: "2022-11-15",
});

export const Stripe = {
	connect: async (code: string) => {
		const response = await client.oauth.token({
			grant_type: "authorization_code",
			code: code,
		});

		return response;
	},
	disconnect: async (stripeUserId: string) => {
		const response = await client.oauth.deauthorize({
			client_id: `${process.env.S_CLIENT_ID}`,
			stripe_user_id: stripeUserId,
		});

		return response;
	},
};
