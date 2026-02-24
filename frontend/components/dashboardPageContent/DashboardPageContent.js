"use client";
import OpenChatsItem from "@/components/openChatsItem/OpenChatsItem";
import PanelHeader from "@/components/panelHeader/PanelHeader";
import StatisticProgressItem from "@/components/statisticProgressItem/StatisticProgressItem";
import StatisticsItem from "@/components/statisticsItem/StatisticsItem";
import useOpenChatsQuery from "@/hooks/useOpenChatsQuery";
import { useUIStore } from "@/store/uiStore";
import {
    faClock,
    faComments,
    faEnvelope,
    faEnvelopeOpenText,
    faFaceAngry,
    faFaceGrinBeam,
    faFaceMeh,
    faHeartPulse,
    faSitemap,
    faStar,
    faTicket,
    faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OpenChatsItemLoading from "../openChatsItemLoading/OpenChatsItemLoading";
import useRoomInfiniteQuery from "@/hooks/useRoomInfiniteQuery";
import StatisticProgressItemLoading from "../statisticProgressItemLoading/StatisticProgressItemLoading";
import useStatisticsQuery from "@/hooks/useStatisticsQuery";
import useIdQuery from "@/hooks/useIdQuery";
import StatisticsItemLoading from "../statisticsItemLoading/StatisticsItemLoading";
import FaildToFetchStatistics from "../faildToFetchStatistics/FaildToFetchStatistics";
import NoMoreOpenChat from "../noMoreOpenChat/NoMoreOpenChat";
export default function DashboardPageContent() {
    const theme = useUIStore((s) => s.theme);
    const {
        data: roomsData,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        status: roomsStatus,
    } = useRoomInfiniteQuery();
    const { data: adminIdentityData, status: adminIdStatus } = useIdQuery();

    const { data: adminStatistics, status: adminStatisticStatus } =
        useStatisticsQuery(adminIdentityData?.id);
    const finalStatisticStatus =
        adminIdStatus === "error" ? "error" : adminStatisticStatus;
    const rooms = roomsData?.pages?.flatMap((p) => p.items) ?? [];
    const { data: ticketsStatistics, status: ticketsStatisticsStatus } =
        useOpenChatsQuery();

    return (
        <>
            <div
                className={`${
                    theme == "dark" ? "bg-gray-900" : "bg-gray-200"
                } min-h-svh`}
            >
                <PanelHeader title={"داشبورد"} theme={theme} />
                <div className="dashboard-page p-5 md:pr-20">
                    <div className="section">
                        <div className="statistics-items-container">
                            <div className="row flex flex-wrap">
                                {finalStatisticStatus === "pending" ? (
                                    <>
                                        <div className="col w-full sm:w-1/2 lg:w-1/4 p-2">
                                            <StatisticsItemLoading />
                                        </div>
                                        <div className="col w-full sm:w-1/2 lg:w-1/4 p-2">
                                            <StatisticsItemLoading />
                                        </div>
                                        <div className="col w-full sm:w-1/2 lg:w-1/4 p-2">
                                            <StatisticsItemLoading />
                                        </div>
                                        <div className="col w-full sm:w-1/2 lg:w-1/4 p-2">
                                            <StatisticsItemLoading />
                                        </div>
                                    </>
                                ) : finalStatisticStatus === "success" ? (
                                    <>
                                        <div className="col w-full sm:w-1/2 lg:w-1/4 p-2">
                                            <StatisticsItem
                                                title={"تیکت های جدید"}
                                                info={
                                                    rooms?.filter(
                                                        (room) =>
                                                            room.status ===
                                                            "open",
                                                    ).length
                                                }
                                                icon={
                                                    <FontAwesomeIcon
                                                        className="text-blue-500"
                                                        icon={
                                                            faEnvelopeOpenText
                                                        }
                                                    />
                                                }
                                                theme={theme}
                                            />
                                        </div>
                                        <div className="col w-full sm:w-1/2 lg:w-1/4 p-2">
                                            <StatisticsItem
                                                title={
                                                    "میانگین زمان اولین پاسخ"
                                                }
                                                info={
                                                    (adminStatistics?.average_first_response_seconds
                                                        ? adminStatistics?.average_first_response_seconds
                                                        : 0) + "s"
                                                }
                                                icon={
                                                    <FontAwesomeIcon
                                                        className="text-green-500"
                                                        icon={faClock}
                                                    />
                                                }
                                                theme={theme}
                                            />
                                        </div>
                                        <div className="col w-full sm:w-1/2 lg:w-1/4 p-2">
                                            <StatisticsItem
                                                title={"رضایت مشتری"}
                                                info={
                                                    adminStatistics?.satisfying_percentage +
                                                    "%"
                                                }
                                                icon={
                                                    <FontAwesomeIcon
                                                        className="text-yellow-500"
                                                        icon={faStar}
                                                    />
                                                }
                                                theme={theme}
                                            />
                                        </div>
                                        <div className="col w-full sm:w-1/2 lg:w-1/4 p-2">
                                            <StatisticsItem
                                                title={"احساسات کاربران"}
                                                info={
                                                    <div className="face-container flex gap-2">
                                                        <div className="happy flex items-center text-green-500 gap-1">
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faFaceGrinBeam
                                                                }
                                                            />
                                                            <span className="count">
                                                                {
                                                                    adminStatistics
                                                                        ?.faces
                                                                        .happy
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="meh flex items-center text-yellow-500 gap-1">
                                                            <FontAwesomeIcon
                                                                icon={faFaceMeh}
                                                            />
                                                            <span className="count">
                                                                {
                                                                    adminStatistics
                                                                        ?.faces
                                                                        .neutral
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="angry flex items-center text-red-500 gap-1">
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faFaceAngry
                                                                }
                                                            />
                                                            <span className="count">
                                                                {
                                                                    adminStatistics
                                                                        ?.faces
                                                                        .sad
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                }
                                                icon={
                                                    <FontAwesomeIcon
                                                        className="text-red-500"
                                                        icon={faHeartPulse}
                                                    />
                                                }
                                                theme={theme}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    finalStatisticStatus === "error" && (
                                        <div className="error-container p-2 w-full">
                                            <FaildToFetchStatistics />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                        <div className="section">
                            <div className="row flex flex-wrap">
                                <div className="col w-full md:w-1/2 p-2">
                                    <div
                                        className={`open-chats ${
                                            theme == "dark"
                                                ? "bg-gray-800"
                                                : "bg-white"
                                        } rounded-lg p-5`}
                                    >
                                        <div className="title-icon flex items-center gap-2">
                                            <FontAwesomeIcon
                                                className="text-blue-500 text-xl"
                                                icon={faTicket}
                                            />
                                            <div
                                                className={`title ${
                                                    theme == "dark"
                                                        ? "text-gray-100"
                                                        : "text-gray-800"
                                                } font-bold`}
                                            >
                                                چت های باز
                                            </div>
                                        </div>
                                        <div className="open-chats-items-container flex flex-col gap-2 mt-5">
                                            {roomsStatus === "pending" ? (
                                                <>
                                                    <OpenChatsItemLoading
                                                        theme={theme}
                                                    />
                                                    <OpenChatsItemLoading
                                                        theme={theme}
                                                    />
                                                    <OpenChatsItemLoading
                                                        theme={theme}
                                                    />
                                                    <OpenChatsItemLoading
                                                        theme={theme}
                                                    />
                                                </>
                                            ) : roomsStatus === "success" ? (
                                                rooms.filter(
                                                    (room) =>
                                                        room.status === "open",
                                                ).length === 0 ? (
                                                    <NoMoreOpenChat />
                                                ) : (
                                                    rooms.map((room) => {
                                                        if (
                                                            room.status ===
                                                            "open"
                                                        ) {
                                                            return (
                                                                <OpenChatsItem
                                                                    key={
                                                                        room.id
                                                                    }
                                                                    cusName={
                                                                        room.customer_display_name
                                                                    }
                                                                    lastMessageTime={
                                                                        room
                                                                            .last_message
                                                                            ?.created_at
                                                                    }
                                                                    problem={
                                                                        room.label
                                                                    }
                                                                    no={room?.customer_id?.slice(
                                                                        -5,
                                                                    )}
                                                                    theme={
                                                                        theme
                                                                    }
                                                                    chatURL={`/dashboard/chats/${room.id}`}
                                                                />
                                                            );
                                                        }
                                                    })
                                                )
                                            ) : (
                                                roomsStatus === "error" && (
                                                    <FaildToFetchStatistics />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col w-full md:w-1/2 p-2">
                                    <div
                                        className={`statistics ${
                                            theme == "dark"
                                                ? "bg-gray-800"
                                                : "bg-white"
                                        } rounded-lg p-5`}
                                    >
                                        <div className="title-icon flex items-center gap-2">
                                            <FontAwesomeIcon
                                                className="text-purple-500 text-xl"
                                                icon={faSitemap}
                                            />
                                            <div
                                                className={`title ${
                                                    theme == "dark"
                                                        ? "text-gray-100"
                                                        : "text-gray-800"
                                                } font-bold`}
                                            >
                                                آمار 24 ساعت گذشته
                                            </div>
                                        </div>
                                        <div className="statistics-progress-container flex flex-col gap-4 mt-5">
                                            {ticketsStatisticsStatus ===
                                            "pending" ? (
                                                <>
                                                    <StatisticProgressItemLoading
                                                        theme={theme}
                                                    />
                                                    <StatisticProgressItemLoading
                                                        theme={theme}
                                                    />
                                                    <StatisticProgressItemLoading
                                                        theme={theme}
                                                    />
                                                </>
                                            ) : ticketsStatisticsStatus ===
                                              "success" ? (
                                                <>
                                                    <StatisticProgressItem
                                                        title={"چت های بسته"}
                                                        icon={
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faEnvelope
                                                                }
                                                            />
                                                        }
                                                        info={
                                                            ticketsStatistics.closed
                                                        }
                                                        color="text-blue-500"
                                                        barColor="bg-blue-500"
                                                        theme={theme}
                                                        total={
                                                            ticketsStatistics.total
                                                        }
                                                    />
                                                    <StatisticProgressItem
                                                        title={"چت های باز"}
                                                        icon={
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faComments
                                                                }
                                                            />
                                                        }
                                                        info={
                                                            ticketsStatistics.open
                                                        }
                                                        color="text-green-500"
                                                        barColor="bg-green-500"
                                                        theme={theme}
                                                        total={
                                                            ticketsStatistics.total
                                                        }
                                                    />
                                                    <StatisticProgressItem
                                                        title={"در انتظار"}
                                                        icon={
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faUserShield
                                                                }
                                                            />
                                                        }
                                                        info={
                                                            ticketsStatistics.in_progress
                                                        }
                                                        color="text-violet-500"
                                                        barColor="bg-violet-500"
                                                        theme={theme}
                                                        total={
                                                            ticketsStatistics.total
                                                        }
                                                    />
                                                </>
                                            ) : (
                                                ticketsStatisticsStatus ===
                                                    "error" && (
                                                    <FaildToFetchStatistics />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
