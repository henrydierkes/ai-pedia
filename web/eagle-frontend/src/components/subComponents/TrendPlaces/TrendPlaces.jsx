import React, { useEffect, useRef, useState } from "react";
import "./TrendPlaces.css";
import TrendPlace from "../TrendPlace/TrendPlace";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

const images = [
    {url: "images/Woodruff_Library.jpeg", name: 'Woodruff Library', rating: 4.9},
    {url: "images/cand.jpeg", name: 'Candler', rating: 4.6},
    {url: "images/oxford.jpeg", name: 'Oxford Library', rating: 4.7},
    {url: "images/candler.jpeg", name: 'Candler Library', rating: 4.3},
    {url: "images/campus_background.jpeg", name: 'Campus', rating: 4.5},
    {url: "images/convocation-hall.png", name: 'Convo Hall', rating: 4.8},
    {url: "images/entrance.jpeg", name: 'Entrance', rating: 4.3},
    {url: "images/sign.jpeg", name: 'Sign', rating: 4.5},
    {url: "images/building.jpeg", name: 'Some Building', rating: 5.0},
    {url: "images/quad.jpeg", name: 'Quad', rating: 4.2}
];

// Sort the images array by rating in descending order
const sortedImages = [...images].sort((a, b) => b.rating - a.rating);

function TrendPlaces() {
    const slider = useRef(null);
    const [slidesToShow, setSlidesToShow] = useState(6);

    const updateSlidesToShow = () => {
        const screenWidth = window.innerWidth;
        let slides = Math.min(Math.max(1, Math.floor(screenWidth / 200)), 6);
        setSlidesToShow(slides);
    };

    useEffect(() => {
        updateSlidesToShow();
        window.addEventListener('resize', updateSlidesToShow);
        return () => {
            window.removeEventListener('resize', updateSlidesToShow);
        };
    }, []);

    const settings = {
        dot: false,
        centerMode: true,
        speed: 300,
        infinite: true,
        slidesToShow: slidesToShow,
        arrows: false,
        autoplay: false,
    };

    return (
        <div className="TrendPlaces">
            <div className="buttons">
                <button className="prev" onClick={() => slider.current?.slickPrev()}>
                    <i className="fas fa-angle-left" style={{ fontSize: "24px" }}></i>
                </button>
                <button className="next" onClick={() => slider.current?.slickNext()}>
                    <i className="fas fa-angle-right" style={{ fontSize: "24px" }}></i>
                </button>
            </div>
            <div className="SliderContainer">
                <Slider ref={slider} {...settings}>
                    {sortedImages.map(({ url, name, rating }, index) => (
                        <TrendPlace key={index} placeName={name} imageUrl={url} placeRating={rating.toFixed(1)} />
                    ))}
                </Slider>
            </div>
        </div>
    );
}

export default TrendPlaces;
