import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Affix, Layout } from "antd";
import reportWebVitals from "./reportWebVitals";
import {
	AppHeader,
	Listings,
	Listing,
	Home,
	Host,
	NotFound,
	User,
	Login,
} from "./sections";
import "./styles/index.css";
import "antd/dist/reset.css";
import { Viewer } from "./lib/types";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

const client = new ApolloClient({
	cache: new InMemoryCache(),
	uri: "/api",
});

const initialViewer: Viewer = {
	id: null,
	token: null,
	avatar: null,
	hasWallet: null,
	didRequest: false,
};

const App = () => {
	const [viewer, setViewer] = useState(initialViewer);
	console.log(viewer);
	return (
		<Router>
			<Layout id="app">
				<Affix offsetTop={0} className="app__affix-header">
					<AppHeader viewer={viewer} setViewer={setViewer} />
				</Affix>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/host" element={<Host />} />
					<Route path="/listing/:id" element={<Listing />} />
					<Route path="/listings/:location" element={<Listings />} />
					<Route path="/user/:id" element={<User />} />
					<Route path="/login" element={<Login setViewer={setViewer} />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Layout>
		</Router>
	);
};

root.render(
	<React.StrictMode>
		<ApolloProvider client={client}>
			<App />
		</ApolloProvider>
	</React.StrictMode>
);

// If you wa"nt to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
