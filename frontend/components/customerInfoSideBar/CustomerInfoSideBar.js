"use client";

import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CustomerInfoSideBar({
    sideBarStatus,
    setSideBarStatus,
    theme,
    cusname,
    cusemail,
    status,
}) {
    return (
        <div
            className={`${sideBarStatus ? "w-60 sm:w-65" : "w-0"} h-full whitespace-nowrap left-0 top-0 transition-all duration-300 absolute`}
        >
            <button
                onClick={() => setSideBarStatus(!sideBarStatus)}
                className={`cursor-pointer absolute ${theme == "dark" ? "bg-gray-800 border-gray-600 text-gray-200 border-l-gray-800" : "bg-white border-gray-200 border-l-white text-gray-800"} -right-9.5 top-60 border pt-2 flex flex-col items-center w-10 h-40 rounded-r-2xl`}
            >
                <FontAwesomeIcon
                    icon={faAngleRight}
                    className={`transition-all duration-300 ${sideBarStatus && "rotate-180"}`}
                />
                <span className="whitespace-nowrap text-xs -rotate-90 mt-14">
                    نمایش اطلاعات مشتری
                </span>
            </button>
            <div
                className={`customer-info-section ${theme == "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"} w-full h-full border border-y-0 border-l-0  p-3`}
            >
                <div className="title">
                    <h5
                        className={` ${theme == "dark" ? "text-gray-100" : "text-gray-800"} text-sm font-bold`}
                    >
                        اطلاعات مشتری
                    </h5>
                </div>
                <div className="customer-info mt-3">
                    <ul className="flex flex-col gap-2">
                        <li className="flex items-center text-xs gap-1">
                            <p
                                className={`title ${theme == "dark" ? "text-gray-100" : "text-gray-800"} font-bold`}
                            >
                                نام:
                            </p>
                            {status === "pending" ? (
                                <div
                                    className={`h-3 w-24 rounded animate-pulse ${
                                        theme === "dark"
                                            ? "bg-gray-700"
                                            : "bg-gray-300"
                                    }`}
                                />
                            ) : (
                                status === "success" && (
                                    <p
                                        className={`info ${theme == "dark" ? "text-gray-400" : "text-gray-600"}`}
                                    >
                                        {cusname}
                                    </p>
                                )
                            )}
                        </li>
                        <li className="flex items-center text-xs gap-1">
                            <p
                                className={`title ${theme == "dark" ? "text-gray-100" : "text-gray-800"} font-bold`}
                            >
                                ایمیل:
                            </p>
                            {status === "pending" ? (
                                <div
                                    className={`h-3 w-32 rounded animate-pulse ${
                                        theme === "dark"
                                            ? "bg-gray-700"
                                            : "bg-gray-300"
                                    }`}
                                />
                            ) : status === 'success' && (
                                <p
                                    className={`info ${theme == "dark" ? "text-gray-400" : "text-gray-600"}`}
                                >
                                    {cusemail}
                                </p>
                            )}
                        </li>
                        {/* <li className="flex items-center text-xs gap-1">
                            <p
                                className={`title ${theme == "dark" ? "text-gray-100" : "text-gray-800"} font-bold`}
                            >
                                شرکت:
                            </p>
                            <p
                                className={`info ${theme == "dark" ? "text-gray-400" : "text-gray-600"}`}
                            >
                                خصوصی
                            </p>
                        </li> */}
                    </ul>
                </div>
            </div>
        </div>
    );
}
