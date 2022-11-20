import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { setContext } from "@apollo/client/link/context";
import {
	ApolloClient,
	ApolloProvider,
	createHttpLink,
	InMemoryCache,
	useMutation,
} from "@apollo/client";
import { Affix, Layout, Spin } from "antd";
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
import { LOG_IN } from "./lib/graphql/mutation";
import {
	LogIn as LogInData,
	LogInVariables,
} from "./lib/graphql/mutation/Login/__generated__/LogIn";
import "./styles/index.css";
import "antd/dist/reset.css";
import { Viewer } from "./lib/types";
import { AppHeaderSkeleton, ErrorBanner } from "./lib/components";

const httpLink = createHttpLink({ uri: "/api" });

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

const authLink = setContext(() => {
	return {
		headers: {
			"x-csrf-token": sessionStorage.getItem("token"),
		},
	};
});

const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
});

const initialViewer: Viewer = {
	id: null,
	token: null,
	avatar: null,
	hasWallet: null,
	didRequest: false,
};

const App = () => {
	const [viewer, setViewer] = useState<Viewer>(initialViewer);

	const [logIn, { error }] = useMutation<LogInData, LogInVariables>(LOG_IN, {
		onCompleted: (data) => {
			if (data && data.logIn) {
				setViewer(data.logIn);

				if (data.logIn.token) {
					sessionStorage.setItem("token", data.logIn.token);
				} else {
					sessionStorage.removeItem("token");
				}
			}
		},
	});

	const logInRef = useRef(logIn);

	useEffect(() => {
		logInRef.current();
	}, []);

	if (!viewer.didRequest && !error) {
		return (
			<Layout className="app-skeleton">
				<AppHeaderSkeleton />
				<div className="app-skeleton__spin-section">
					<Spin size="large" tip="Launching Tinyhouse" />
				</div>
			</Layout>
		);
	}

	const logInErrorBannerElement = error ? (
		<ErrorBanner description="We weren't able to verify if you were logged in. Please try again later!" />
	) : null;

	return (
		<Router>
			<Layout id="app">
				<Affix offsetTop={0} className="app__affix-header">
					<AppHeader viewer={viewer} setViewer={setViewer} />
				</Affix>
				{logInErrorBannerElement}
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
