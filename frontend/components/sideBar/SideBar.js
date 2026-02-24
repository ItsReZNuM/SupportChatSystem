"use client";

import Line from "../line/Line";
import {
    faChartPie,
    faInbox,
    faComments,
    faChartLine,
    faClockRotateLeft,
    faUsers,
    faUserTag,
    faUsersGear,
    faBook,
    faRobot,
    faBookMedical,
    faHourglassHalf,
    faPlug,
    faRocket,
    faVial,
    faGear,
    faRightFromBracket,
    faMeteor,
} from "@fortawesome/free-solid-svg-icons";
import SideBarItem from "../sideBarItem/SideBarItem";
import { usePathname } from "next/navigation";
import { useState } from "react";
import FloatingTitle from "../floatingTitle/FloatingTitle";
import SideBarThemeBtn from "../sidBarThemeBtn/SideBarThemeBtn";
import { useUIStore } from "@/store/uiStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideBarLogOutBtn from "../sideBarlogOutBtn/SideBarLogOutBtn";

export default function SideBar() {
    const route = usePathname();
    const [titleY, setTitleY] = useState(0);
    const [titleVisible, setTitleVisible] = useState(false);
    const [floatingTitle, setFloatingTitle] = useState("");
    const theme = useUIStore((s) => s.theme);

    const resItemsData = [
        {
            id: 1,
            icon: <FontAwesomeIcon icon={faChartPie} />,
            link: "/dashboard",
            title: "داشبورد",
            route,
            theme,
        },
        {
            id: 2,
            icon: <FontAwesomeIcon icon={faInbox} />,
            link: "/",
            title: "صندوق ورودی",
            route,
            theme,
        },
        {
            id: 3,
            icon: <FontAwesomeIcon icon={faComments} />,
            link: "/dashboard/chats",
            title: "پیام ها",
            route,
            theme,
        },
        {
            id: 4,
            icon: <FontAwesomeIcon icon={faChartLine} />,
            link: "/",
            title: "آمار ها",
            route,
            theme,
        },
        {
            id: 5,
            icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
            link: "/",
            title: "تاریخچه",
            route,
            theme,
        },
        {
            id: 6,
            icon: <FontAwesomeIcon icon={faUsers} />,
            link: "/",
            title: "کاربران",
            route,
            theme,
        },
        {
            id: 7,
            icon: <FontAwesomeIcon icon={faUserTag} />,
            link: "/",
            title: "تیکت",
            route,
            theme,
        },
        {
            id: 8,
            icon: <FontAwesomeIcon icon={faUsersGear} />,
            link: "/",
            title: "مدیریت کاربران",
            route,
            theme,
        },
        {
            id: 9,
            icon: <FontAwesomeIcon icon={faBook} />,
            link: "/",
            title: "کتاب",
            route,
            theme,
        },
        {
            id: 10,
            icon: <FontAwesomeIcon icon={faRobot} />,
            link: "/",
            title: "ربات",
            route,
            theme,
        },
        {
            id: 11,
            icon: <FontAwesomeIcon icon={faBookMedical} />,
            link: "/",
            title: "کتاب مثبت",
            route,
            theme,
        },
        {
            id: 12,
            icon: <FontAwesomeIcon icon={faHourglassHalf} />,
            link: "/",
            title: "ساعت شنی",
            route,
            theme,
        },
        {
            id: 13,
            icon: <FontAwesomeIcon icon={faPlug} />,
            link: "/",
            title: "دو شاخه",
            route,
            theme,
        },
        {
            id: 14,
            icon: <FontAwesomeIcon icon={faRocket} />,
            link: "/",
            title: "موشک",
            route,
            theme,
        },
        {
            id: 15,
            icon: <FontAwesomeIcon icon={faVial} />,
            link: "/",
            title: "لوله آزمایشگاه",
            route,
            theme,
        },
        {
            id: 16,
            icon: <FontAwesomeIcon icon={faGear} />,
            link: "/",
            title: "تنظیمات",
            route,
            theme,
        },
        {
            id: 17,
            title: "تغییر تم",
        },
        {
            id: 18,
            title: "خروج",
            icon: <FontAwesomeIcon icon={faRightFromBracket} />,
        },
    ];

    return (
        <>
            <div className="hidden md:block">
                <FloatingTitle
                    floatingTitle={floatingTitle}
                    titleY={titleY}
                    titleVisible={titleVisible}
                    theme={theme}
                />
                <div
                    className={`side-bar fixed top-0 right-0 ${
                        theme == "dark"
                            ? "bg-gray-800 dark-gray-scroll"
                            : "bg-white gray-scroll"
                    } h-svh p-3 flex flex-col items-center overflow-y-auto overflow-x-hidden`}
                >
                    <div className="logo text-blue-500 text-2xl">
                        <FontAwesomeIcon icon={faMeteor} />
                    </div>
                    <div className="nav mt-5">
                        <ul className="flex flex-col items-center gap-2">
                            {resItemsData.map((item) => {
                                return item.id === 17 ? (
                                    <li key={item.id}>
                                        <Line axis={"h"} />
                                        <SideBarThemeBtn
                                            title={item.title}
                                            setTitleY={setTitleY}
                                            setTitleVisible={setTitleVisible}
                                            setFloatingTitle={setFloatingTitle}
                                        />
                                    </li>
                                ) : item.id === 18 ? (
                                    <SideBarLogOutBtn
                                        key={item.id}
                                        title={item.title}
                                        icon={item.icon}
                                        setTitleY={setTitleY}
                                        setTitleVisible={setTitleVisible}
                                        setFloatingTitle={setFloatingTitle}
                                        theme={theme}
                                    />
                                ) : (
                                    <li key={item.id}>
                                        {item.id == 15 && <Line axis={"h"} />}
                                        <SideBarItem
                                            icon={item.icon}
                                            link={item.link}
                                            title={item.title}
                                            route={route}
                                            setTitleY={setTitleY}
                                            setTitleVisible={setTitleVisible}
                                            setFloatingTitle={setFloatingTitle}
                                            theme={theme}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
