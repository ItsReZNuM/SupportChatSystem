"use client";
import { usePathname } from "next/navigation";
import ResSideBarItem from "../resSideBarItem/ResSideBarItem";
import { useUIStore } from "@/store/uiStore";
import ResSideBarIcon from "../resSideBarIcon/ResSideBarIcon";
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
} from "@fortawesome/free-solid-svg-icons";
import ResThemeBtn from "../resThemeBtn/ResThemeBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AdminIdentity from "../adminIdentity/AdminIdentity";
import ResLogOutBtn from "../resLogOutBtn/ResLogOutBtn";

export default function ResSideBar() {
    const route = usePathname();
    const theme = useUIStore((s) => s.theme);
    const menuOpen = useUIStore((s) => s.menuOpen);

    const resItemsData = [
        {
            id: 1,
            icon: <FontAwesomeIcon icon={faChartPie} />,
            link: "/dashboard",
            title: "داشبورد",
        },
        {
            id: 2,
            icon: <FontAwesomeIcon icon={faInbox} />,
            link: "/",
            title: "صندوق ورودی",
        },
        {
            id: 3,
            icon: <FontAwesomeIcon icon={faComments} />,
            link: "/dashboard/chats",
            title: "پیام ها",
        },
        {
            id: 4,
            icon: <FontAwesomeIcon icon={faChartLine} />,
            link: "/",
            title: "آمار ها",
        },
        {
            id: 5,
            icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
            link: "/",
            title: "تاریخچه",
        },
        {
            id: 6,
            icon: <FontAwesomeIcon icon={faUsers} />,
            link: "/",
            title: "کاربران",
        },
        {
            id: 7,
            icon: <FontAwesomeIcon icon={faUserTag} />,
            link: "/",
            title: "تیکت",
        },
        {
            id: 8,
            icon: <FontAwesomeIcon icon={faUsersGear} />,
            link: "/",
            title: "مدیریت کاربران",
        },
        {
            id: 9,
            icon: <FontAwesomeIcon icon={faBook} />,
            link: "/",
            title: "کتاب",
        },
        {
            id: 10,
            icon: <FontAwesomeIcon icon={faRobot} />,
            link: "/",
            title: "ربات",
        },
        {
            id: 11,
            icon: <FontAwesomeIcon icon={faBookMedical} />,
            link: "/",
            title: "کتاب مثبت",
        },
        {
            id: 12,
            icon: <FontAwesomeIcon icon={faHourglassHalf} />,
            link: "/",
            title: "ساعت شنی",
        },
        {
            id: 13,
            icon: <FontAwesomeIcon icon={faPlug} />,
            link: "/",
            title: "دو شاخه",
        },
        {
            id: 14,
            icon: <FontAwesomeIcon icon={faRocket} />,
            link: "/",
            title: "موشک",
        },
        {
            id: 15,
            icon: <FontAwesomeIcon icon={faVial} />,
            link: "/",
            title: "لوله آزمایشگاه",
        },
        {
            id: 16,
            icon: <FontAwesomeIcon icon={faGear} />,
            link: "/",
            title: "تنظیمات",
        },
        {
            id: 17,
            title: "تغییر تم",
        },
        {
            id: 18,
            icon: <FontAwesomeIcon icon={faRightFromBracket} />,
            title: "خروج",
        },
    ];

    return (
        <>
            <div
                className={`
        md:hidden
        fixed top-0 right-0 h-svh w-52 ${
            theme == "dark"
                ? "bg-gray-800 dark-gray-scroll"
                : "bg-white gray-scroll"
        } z-30
        overflow-y-scroll
        transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "translate-x-full"}
      `}
            >
                <div className="p-3">
                    <ResSideBarIcon />
                </div>
                <div className="nav">
                    <ul className="flex flex-col">
                        <li className="py-3 px-2">
                            <AdminIdentity theme={theme} />
                        </li>
                        {resItemsData.map((item) => {
                            return item.id === 17 ? (
                                <ResThemeBtn key={item.id} />
                            ) : item.id === 18 ? (
                                <ResLogOutBtn
                                    key={item.id}
                                    title={item.title}
                                    icon={item.icon}
                                    theme={theme}
                                />
                            ) : (
                                <ResSideBarItem
                                    key={item.id}
                                    icon={item.icon}
                                    link={item.link}
                                    title={item.title}
                                    route={route}
                                    theme={theme}
                                />
                            );
                        })}
                    </ul>
                </div>
            </div>
        </>
    );
}
