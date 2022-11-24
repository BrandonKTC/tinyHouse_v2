import { Pagination } from "antd";

interface Props {
	total: number;
	page: number;
	limit: number;
	setPage: (page: number) => void;
}

export const ListingsPagination = ({ total, page, limit, setPage }: Props) => {
	return (
		<Pagination
			current={page}
			onChange={(page: number) => setPage(page)}
			total={total}
			hideOnSinglePage={true}
			className="listings-pagination"
		/>
	);
};
