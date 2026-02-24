"use client";
import useIdQuery from "@/hooks/useIdQuery";
import { faUserGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FaildToFetchData from "../faildToFetchData/FaildToFetchData";


export default function AdminIdentity({ theme }) {

    const { data, status } = useIdQuery();
    return (
        <>
            <div
                className={`admin-identity flex ${
                    theme == "dark" ? "bg-gray-700" : " bg-gray-200"
                } w-full h-13 mr-auto rounded-lg flex-row-reverse items-center p-2 gap-2`}
            >
                <div className="icon size-10 p-3 rounded-xl flex justify-center items-center bg-blue-500 text-white">
                    <FontAwesomeIcon icon={faUserGear} />
                </div>
                <div className="info flex flex-col items-end font-normal w-full">
                    {status === "pending" ? (
                        <>
                            <div className="flex flex-col items-end gap-2 w-full">
                                <div className="h-4 w-32 md:w-48 rounded bg-gray-300/70 dark:bg-gray-600 animate-pulse" />

                                <div className="h-3 w-16 rounded bg-gray-300/50 dark:bg-gray-600/70 animate-pulse" />
                            </div>
                        </>
                    ) : status === "success" ? (
                        <>
                            <p
                                className={`
                email text-sm max-w-30 md:max-w-50 truncate
                text-left
                [direction:ltr]
                ${theme === "dark" ? "text-gray-300" : "text-gray-800"}
            `}
                            >
                                {data.email}
                            </p>
                            <p
                                className={`role text-xs ${
                                    theme == "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                }`}
                            >
                                {data.is_admin && "admin"}
                            </p>
                        </>
                    ) : status === 'error' && (
                       <FaildToFetchData size={'sm'} />
                    )}
                </div>
            </div>
        </>
    );
}
