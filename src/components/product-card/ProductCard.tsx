import React from "react";
import "./ProductCard.scss";

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface Props {
    product: Product;
    onClick: () => void;
}

const ProductCard: React.FC<Props> = ({ product, onClick }) => {
    return (
        <div className="product-card" onClick={onClick}>
            <h2>{product.name}</h2>
            <p>Cena: {product.price} PLN</p>
            <p>Ilość: {product.quantity}</p>
        </div>
    );
};

export default ProductCard;
