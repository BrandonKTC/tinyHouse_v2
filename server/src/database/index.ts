import { MongoClient } from "mongodb";
import { Database, User, Listing, Booking } from "../lib/types";

const user = process.env.USERNAME;
const userPassword = process.env.USERPASSWORD;
const cluster = process.env.CLUSTER;

const url = `mongodb+srv://${user}:${userPassword}@${cluster}.mongodb.net/?retryWrites=true&w=majority`;

export const connectDatabase = async (): Promise<Database> => {
	const client = await MongoClient.connect(url);

	const db = client.db("main");

	return {
		bookings: db.collection<Booking>("bookings"),
		listings: db.collection<Listing>("listings"),
		users: db.collection<User>("users"),
	};
};
