import crypto from "crypto";
import { IResolvers } from "@graphql-tools/utils";
import { authorize, Google, Stripe } from "../../../lib";
import { Database, Viewer, User } from "../../../lib/types";
import { ConnectStripeArgs, LogInArgs } from "./types";
import { Request, Response } from "express";

const cookieOptions = {
	httpOnly: true,
	sameSite: true,
	signed: true,
	secure: process.env.NODE_ENV === "development" ? false : true,
};

const logInViaGoogle = async (
	code: string,
	token: string,
	db: Database,
	res: Response
): Promise<User | null> => {
	const { user } = await Google.logIn(code);

	if (!user) {
		throw new Error("Google login error");
	}

	// Name/Photo/Email Lists
	const userNamesList = user.names && user.names.length ? user.names : null;
	const userPhotosList = user.photos && user.photos.length ? user.photos : null;
	const userEmailsList =
		user.emailAddresses && user.emailAddresses.length
			? user.emailAddresses
			: null;

	// User Display Name
	const userName = userNamesList ? userNamesList[0].displayName : null;

	// User Id
	const userId =
		userNamesList &&
		userNamesList[0].metadata &&
		userNamesList[0].metadata.source
			? userNamesList[0].metadata.source.id
			: null;

	// User Avatar
	const userAvatar =
		userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;

	// User Email
	const userEmail =
		userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;

	// We'll first attempt to check if this user already exists in our database.
	if (!userId || !userName || !userAvatar || !userEmail) {
		throw new Error("Google login error");
	}

	// If the user already exists, we'll update the user information in the database to the latest information we get from Google.
	const updateRes = await db.users.findOneAndUpdate(
		// Mongo will select the first document where _id field matches the userId we've obtained from Google.
		{ _id: userId },
		{
			// Update the name, avatar, and contact fields of our document with the latest Google data.
			$set: {
				name: userName,
				avatar: userAvatar,
				contact: userEmail,
				token,
			},
		},
		// Means we want to return the updated document (not the original document) and assign the result to the updateRes constant.
		{ returnDocument: "after" }
	);

	let viewer = updateRes.value;

	if (!viewer) {
		// If we weren't able to find an already existing user, we'll want to insert and add a new user into our database.
		const insertRes = await db.users.insertOne({
			_id: userId,
			token,
			name: userName,
			avatar: userAvatar,
			contact: userEmail,
			income: 0,
			bookings: [],
			listings: [],
		});

		viewer = await db.users.findOne({ _id: insertRes.insertedId });
	}

	res.cookie("viewer", userId, {
		...cookieOptions,
		maxAge: 365 * 24 * 60 * 60 * 1000,
	});

	return viewer;
};

const logInViaCookie = async (
	token: string,
	db: Database,
	req: Request,
	res: Response
): Promise<User | null> => {
	const updateRes = await db.users.findOneAndUpdate(
		{ _id: req.signedCookies.viewer },
		{ $set: { token } },
		{ returnDocument: "after" }
	);

	let viewer = updateRes.value;

	if (!viewer) {
		res.clearCookie("viewer", cookieOptions);
	}

	return viewer;
};

export const viewerResolvers: IResolvers = {
	Query: {
		authUrl: () => {
			try {
				return Google.authUrl;
			} catch (err) {
				throw new Error(`Failed to query Google Auth Url: ${err}`);
			}
		},
	},

	Mutation: {
		logIn: async (
			_root: undefined,
			{ input }: LogInArgs,
			{ db, req, res }: { db: Database; req: Request; res: Response }
		): Promise<Viewer> => {
			try {
				const code = input ? input.code : null;
				const token = crypto.randomBytes(16).toString("hex");
				const viewer: User | null = code
					? await logInViaGoogle(code, token, db, res)
					: await logInViaCookie(token, db, req, res);

				if (!viewer) {
					return { didRequest: true };
				}

				return {
					_id: viewer._id,
					token: viewer.token,
					avatar: viewer.avatar,
					walletId: viewer.walletId,
					didRequest: true,
				};
			} catch (err) {
				throw new Error(`Failed to log in: ${err}`);
			}
		},
		logOut: (
			_root: undefined,
			_args: {},
			{ res }: { res: Response }
		): Viewer => {
			try {
				res.clearCookie("viewer", cookieOptions);
				return { didRequest: true };
			} catch (error) {
				throw new Error(`Failed to log out: ${error}`);
			}
		},
		connectStripe: async (
			_root: undefined,
			{ input }: ConnectStripeArgs,
			{ db, req }: { db: Database; req: Request }
		): Promise<Viewer> => {
			try {
				const { code } = input;
				let viewer = await authorize(db, req);

				if (!viewer) {
					throw new Error("Viewer cannot be found");
				}
				const wallet = await Stripe.connect(code);
				if (!wallet) throw new Error("stripe grant Error");

				const updateRes = await db.users.findOneAndUpdate(
					{ _id: viewer._id },
					{ $set: { walletId: wallet.stripe_user_id } },
					{ returnDocument: "after" }
				);
				if (!updateRes.value) throw new Error("viewer could not be updated");

				viewer = updateRes.value;

				return {
					_id: viewer._id,
					token: viewer.token,
					avatar: viewer.avatar,
					walletId: viewer.walletId,
					didRequest: true,
				};
			} catch (error) {
				throw new Error(`Failed to connect with Stripe: ${error}`);
			}
		},
		disconnectStripe: async (
			_root: undefined,
			_args: {},
			{ db, req }: { db: Database; req: Request }
		): Promise<Viewer> => {
			try {
				let viewer = await authorize(db, req);
				if (!viewer) throw new Error("viewer cannor be found");

				if (viewer.walletId) {
					const wallet = await Stripe.disconnect(viewer.walletId);
					if (!wallet) {
						throw new Error("stripe disconnect error");
					}
				}

				const updateRes = await db.users.findOneAndUpdate(
					{ _id: viewer._id },
					{ $set: { walletId: undefined } },
					{ returnDocument: "after" }
				);

				if (!updateRes.value) throw new Error("viewer could not be updated");

				viewer = updateRes.value;

				return {
					_id: viewer._id,
					token: viewer.token,
					avatar: viewer.avatar,
					walletId: viewer.walletId,
					didRequest: true,
				};
			} catch (error) {
				throw new Error(`Failed to disconnect with Stripe: ${error}`);
			}
		},
	},

	Viewer: {
		id: (viewer: Viewer): string | undefined => {
			return viewer._id;
		},
		hasWallet: (viewer: Viewer): true | undefined =>
			viewer.walletId ? true : undefined,
	},
};
