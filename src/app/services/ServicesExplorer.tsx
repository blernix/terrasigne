"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import Link from "next/link";
import { stripHtml } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ServicesExplorer({
  initialCategories,
}: {
  initialCategories: any[];
}) {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const router = useRouter();
  const swiperRefs = useRef<{ [key: number]: any }>({});
  const [hasNavigated, setHasNavigated] = useState(false);
  const [targetServiceId, setTargetServiceId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTargetServiceId(params.get("service"));
  }, []);

  const serviceCategories = initialCategories;

  const serviceMap = useMemo(() => {
    const map: {
      [key: string]: { catIndex: number; serviceIndex: number; catSlug: string };
    } = {};
    serviceCategories.forEach((cat, catIndex) => {
      cat.services.forEach((svc: any, serviceIndex: number) => {
        map[String(svc.id)] = { catIndex, serviceIndex, catSlug: cat.slug };
      });
    });
    return map;
  }, [serviceCategories]);

  useEffect(() => {
    if (targetServiceId) setHasNavigated(false);
  }, [targetServiceId]);

  useEffect(() => {
    if (
      !targetServiceId ||
      !serviceCategories.length ||
      Object.keys(serviceMap).length === 0 ||
      hasNavigated
    )
      return;

    const mapping = serviceMap[targetServiceId];
    if (!mapping) return;

    const { catIndex, serviceIndex, catSlug } = mapping;

    const trySlide = (attempt = 0) => {
      const swiper = swiperRefs.current[catIndex];
      if (swiper) {
        swiper.slideTo(serviceIndex);
        setHasNavigated(true);
        router.replace("/services#category-" + catSlug, { scroll: false });

        setTimeout(() => {
          const serviceElement = document.getElementById(
            "service-" + targetServiceId
          );
          if (serviceElement) {
            const yOffset = -90;
            const y =
              serviceElement.getBoundingClientRect().top +
              window.pageYOffset +
              yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          } else {
            const categoryElement = document.getElementById(
              "category-" + catSlug
            );
            if (categoryElement) {
              const yOffset = -90;
              const y =
                categoryElement.getBoundingClientRect().top +
                window.pageYOffset +
                yOffset;
              window.scrollTo({ top: y, behavior: "smooth" });
            }
          }
        }, 500);
      } else if (attempt < 10) {
        setTimeout(() => trySlide(attempt + 1), 200 * (attempt + 1));
      }
    };

    trySlide();
  }, [targetServiceId, serviceCategories, serviceMap, router, hasNavigated]);

  return (
    <>
      {serviceCategories.map((cat, idx) => (
        <motion.section
          key={idx}
          id={`category-${cat.slug}`}
          className="section scroll-mt-24 border-t border-sand-200/60 bg-sand/20"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.15 }}
        >
          <div className="container-soft">
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow">{`Catégorie ${idx + 1}`}</span>
              <h2 className="mt-4 font-display text-3xl font-semibold text-forest md:text-4xl">
                {cat.category}
              </h2>
              {cat.description && (
                <div
                  className="service-richtext mx-auto mt-4 max-w-2xl text-left"
                  dangerouslySetInnerHTML={{ __html: cat.description }}
                />
              )}
            </div>

            <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div className={`min-w-0 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                <img
                  src={cat.couverture}
                  alt={`Couverture ${cat.category}`}
                  className="h-auto max-h-[480px] w-full max-w-full rounded-4xl object-cover shadow-soft"
                />
              </div>

              <div className={`min-w-0 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="relative w-full px-2">
                  <Swiper
                    modules={[Navigation, Pagination, EffectFade]}
                    spaceBetween={0}
                    navigation={{
                      nextEl: `.next-${idx}`,
                      prevEl: `.prev-${idx}`,
                    }}
                    pagination={{
                      el: `.pagination-${idx}`,
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    breakpoints={{
                      320: { slidesPerView: 1 },
                      768: { slidesPerView: 1 },
                      1024: { slidesPerView: 1 },
                    }}
                    className="!pb-12 w-full max-w-xl mx-auto"
                    onSwiper={(swiper) => {
                      swiperRefs.current[idx] = swiper;
                    }}
                  >
                    {cat.services.map((svc: any, sidx: number) => (
                      <SwiperSlide
                        key={sidx}
                        id={`service-${svc.id}`}
                        className="fade-slide transition-opacity duration-3000 ease-in-out"
                      >
                        <div className="card mx-auto flex min-h-[420px] max-w-lg flex-col justify-between p-8">
                          <h3 className="text-center font-display text-2xl font-semibold text-forest">
                            {svc.titre}
                          </h3>

                          <p className="mt-2 text-center font-display text-xl font-semibold text-violet">
                            {svc.prix ? `${svc.prix} €` : ""}
                          </p>

                          <p className="mt-4 flex-1 overflow-hidden text-center text-sm leading-relaxed text-ink-soft">
                            {stripHtml(svc.description).length > 220
                              ? stripHtml(svc.description).slice(0, 220) + "…"
                              : stripHtml(svc.description) ||
                                "Aucune description."}
                          </p>

                          <div className="mt-6 flex flex-col gap-2">
                            <Link
                              href={`/services/${svc.slug}`}
                              className="btn btn-ghost w-full"
                            >
                              Voir les détails
                            </Link>
                            {svc.rendez_vous ? (
                              <a
                                href={`/rendez-vous?service=${svc.id}`}
                                className="btn btn-primary w-full"
                              >
                                Prendre rendez-vous
                              </a>
                            ) : (
                              <a href="/contact" className="btn btn-primary w-full">
                                Me contacter
                              </a>
                            )}
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {!isMobile && (
                    <>
                      <button
                        className={`prev-${idx} absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sand-200 bg-white p-2.5 shadow-soft transition hover:scale-110`}
                        aria-label="Précédent"
                      >
                        <ChevronLeft className="h-5 w-5 text-forest" />
                      </button>
                      <button
                        className={`next-${idx} absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full border border-sand-200 bg-white p-2.5 shadow-soft transition hover:scale-110`}
                        aria-label="Suivant"
                      >
                        <ChevronRight className="h-5 w-5 text-forest" />
                      </button>
                    </>
                  )}

                  <div
                    className={`swiper-pagination pagination-${idx} z-10 mt-4 flex w-full justify-center`}
                    style={{ minHeight: "24px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      ))}
    </>
  );
}
