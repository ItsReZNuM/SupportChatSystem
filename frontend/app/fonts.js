import localFont from "next/font/local";

export const iranSans = localFont({
    src: [
        {
            path: "../public/fonts/IRANSansXFaNum-Regular.woff2",
            weight: "400",
            style: "normal",
        },
    ],
    display: "swap",
});
