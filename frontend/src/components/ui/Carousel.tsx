import { useEffect } from "react";

interface CarouselProps {
    images: string[];
    interval?: number;
}

export const Carousel = ({
    images,
    interval = 5000,
    currentIndex,
    onIndexChange,
}: CarouselProps & {
    currentIndex: number;
    onIndexChange: (index: number) => void;
}) => {
    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            onIndexChange((currentIndex + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images.length, interval, currentIndex, onIndexChange]);

    if (!images.length) return null;

    return (
        <div className="relative w-full h-full overflow-hidden">
            {images.map((image, index) => (
                <div
                    key={image}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
            {/* Optional: Add a dark overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/20" />
        </div>
    );
};
