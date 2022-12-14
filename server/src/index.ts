import express from "express";
import compression from "compression";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql";
import { connectDatabase } from "./database";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser(process.env.SECRET));
app.use(compression());

app.use(express.static(`${__dirname}/client`));
app.get("/*", (_req, res) => res.sendFile(`${__dirname}/client/index.html`));

async function startserver() {
	const db = await connectDatabase();
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, res }) => ({ db, req, res }),
	});
	await server.start();

	server.applyMiddleware({ app, path: "/api" });
}

startserver();

app.listen(process.env.PORT, () =>
	console.log(`[app]: http://localhost:${process.env.PORT}`)
);
