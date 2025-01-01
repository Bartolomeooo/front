import React from "react";
import "./ReviewList.scss";

interface Review {
    id: number;
    content: string;
    rating: number;
}

const ReviewList: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
    return (
        <div className="review-list">
            <h3>Opinie</h3>
            {reviews.length > 0 ? (
                reviews.map((review) => (
                    <div key={review.id} className="review">
                        <p>{review.content}</p>
                        <p>Ocena: {review.rating}/5</p>
                    </div>
                ))
            ) : (
                <p>Brak opinii dla tego produktu.</p>
            )}
        </div>
    );
};

export default ReviewList;
