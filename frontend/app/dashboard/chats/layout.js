import PanelHeader from "@/components/panelHeader/PanelHeader";
import ChatsLayoutContent from "@/components/chatsLayoutContent/ChatsLayoutContent";
export const metadata = {
    title: "پیام ها",
};

export default function ChatsLayout({ children }) {
    return (
        <>
            <div className="h-svh">
                <PanelHeader title={"پیام ها"} />
                <ChatsLayoutContent>{children}</ChatsLayoutContent>
            </div>
        </>
    );
}
