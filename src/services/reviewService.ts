import axios from "axios";

export const fetchReviewsByProductId = async (productId: number) => {
    const response = await axios.get(`http://localhost:8080/reviews?productId=${productId}`);
    return response.data;
};
