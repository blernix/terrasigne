"use client";
import { useSwipeable } from "react-swipeable";
import { useRouter, usePathname } from "next/navigation";

const pages = ["/", "/services", "/blog", "/contact", "propos", "rendez-vous"];

export default function ClientSwipeWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const idx = pages.indexOf(pathname);

  const handlers = useSwipeable({
    onSwipedLeft: () => idx < pages.length - 1 && router.push(pages[idx + 1]),
    onSwipedRight: () => idx > 0 && router.push(pages[idx - 1]),
    trackTouch: true,
  });

  return <div {...handlers} className="h-full w-full">{children}</div>;
}