import BlockOverlay from "@/components/blockOverlay/BlockOverlay";
import ResSideBar from "@/components/resSideBar/ResSideBar";
import SideBar from "@/components/sideBar/SideBar";

export default function DashboardLayout({ children }) {
  return (
    <div className="section relative">
      <BlockOverlay />
      <ResSideBar />
      <SideBar />
      {children}
    </div>
  );
}
