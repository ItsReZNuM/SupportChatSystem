"use client";

import AdminIdentity from "../adminIdentity/AdminIdentity";
import ResSideBarIcon from "../resSideBarIcon/ResSideBarIcon";
import Line from "../line/Line";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useUIStore } from "@/store/uiStore";

export default function PanelHeader({ title }) {
  const theme = useUIStore((s) => s.theme);

  return (
    <>
      <div
        className={`panel-header pr-5 border-b border-gray-200 md:pr-21.25 py-3 pl-5 font-bold flex justify-between items-center  ${
          theme == "dark"
            ? "bg-gray-800 text-gray-100 border-gray-600"
            : "bg-white text-gray-700 border-gray-200"
        }`}
      >
        <div className="resicon-line-title flex items-center gap-4">
          <ResSideBarIcon />
          <div className="line-container md:hidden">
            <Line axis={"v"} />
          </div>
          <p className="title">{title}</p>
        </div>
        <div className="identity-notif flex flex-row-reverse md:flex-row items-center sm:w-1/2 lg:w-1/3 xl:w-1/4 gap-4">
          <div className="hidden md:block w-full">
            <AdminIdentity theme={theme} />
          </div>
          <FontAwesomeIcon icon={faBell} />
        </div>
      </div>
    </>
  );
}
