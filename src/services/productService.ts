import axios from "axios";

export const fetchProducts = async () => {
    const response = await axios.get("http://localhost:8080/products");
    return response.data;
};

export const fetchProductById = async (id: number) => {
    const response = await axios.get(`http://localhost:8080/products/${id}`);
    return response.data;
};
