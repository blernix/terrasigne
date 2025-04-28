"use client";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules"; // 🎯 On retire Pagination ici
import "swiper/css";

interface CarrouselImage {
  id: number;
  images?: {
    filename_disk?: string;
    title?: string;
  };
}

export default function CarrouselSection({ images }: { images: CarrouselImage[] }) {
  const swiperRef = useRef<any>(null); // 👔 référence Swiper

  return (
    <section className="relative w-full h-full overflow-hidden">
      <Swiper
        modules={[Autoplay]} // 🎯 plus de Pagination ici non plus
        slidesPerView={1}
        loop={true}
        speed={1200}
        autoplay={{
          delay: 1000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          waitForTransition: false,
        }}
        onInit={(swiper) => {
          swiperRef.current = swiper;
          if (!swiper.autoplay.running) {
            swiper.autoplay.start();
          }
        }}
        className="w-full h-full"
        initialSlide={0}
      >
        {images.map((image, index) => {
          const imageUrl = image.images?.filename_disk
            ? `${process.env.NEXT_PUBLIC_DIRECTUS_STORAGE}/uploads/${image.images.filename_disk}`
            : "/images/default-cover.jpg";

          return (
            <SwiperSlide key={image.id} className="w-full h-full relative">
              <div className="w-full h-full overflow-hidden">
                <img
                  src={imageUrl}
                  alt={image.images?.title || `Image ${index + 1}`}
                  className="w-full h-full object-cover scale-100 animate-zoomSlow"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}