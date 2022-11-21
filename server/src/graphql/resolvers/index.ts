import { listingResolvers } from "./Listing";
import { bookingResolvers } from "./Booking";
import { viewerResolvers } from "./Viewer";
import { userResolvers } from "./User";

import merge from "lodash.merge";

export const resolvers = merge(
	viewerResolvers,
	userResolvers,
	listingResolvers,
	bookingResolvers
);
