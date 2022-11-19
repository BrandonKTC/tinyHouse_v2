import { MongoClient } from "mongodb";
import { Database } from "../lib/types";

const user = process.env.USERNAME;
const userPassword = process.env.USERPASSWORD;
const cluster = process.env.CLUSTER;

const url = `mongodb+srv://${user}:${userPassword}@${cluster}.mongodb.net/?retryWrites=true&w=majority`;

export const connectDatabase = async (): Promise<Database> => {
	const client = await MongoClient.connect(url);

	const db = client.db("main");

	return {
		listings: db.collection("test_listings"),
	};
};
