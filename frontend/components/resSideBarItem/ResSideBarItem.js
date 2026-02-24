"use client";
import Link from "next/link";
import Badge from "../badge/badge";

export default function ResSideBarItem({ icon, link, title, route, theme }) {
  return (
    <li className="relative whitespace-nowrap py-3 px-5">
      <Link
        href={link}
        className={`${
          theme == "dark"
            ? route === link
              ? "text-blue-500"
              : "text-gray-400"
            : route === link
            ? "text-blue-500"
            : "text-gray-500"
        } text-lg flex items-center gap-3`}
      >
        <span className="flex items-center justify-center size-5">
          {icon}
        </span>
        <p className="item-name text-sm font-bold">{title}</p>
      </Link>
    </li>
  );
}
