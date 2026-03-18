"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

interface CarrouselImage {
  id: number;
  images?: {
    filename_disk?: string;
    title?: string;
  };
}

export default function CarrouselSection({ images }: { images: CarrouselImage[] }) {
  const imageArray = Array.isArray(images) ? images : [];
  
  if (imageArray.length === 0) {
    return (
      <section className="relative w-full h-full overflow-hidden bg-gray-100">
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500">Aucune image disponible</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-full overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        loop={true}
        speed={1200}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        className="w-full h-full"
      >
        {imageArray.map((image, idx) => {
          const url = image.images?.filename_disk
            ? `${process.env.NEXT_PUBLIC_DIRECTUS_STORAGE}/uploads/${image.images.filename_disk}`
            : "/images/default-cover.jpg";
          return (
            <SwiperSlide key={image.id} className="w-full h-full relative">
               <div className="w-full h-full overflow-hidden">
              <img
                src={url}
                alt={image.images?.title || `Image ${idx + 1}`}
                className="w-full h-full object-cover animate-zoomSlow"
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