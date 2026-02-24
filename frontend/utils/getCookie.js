export const getCookie = (name) => {
    if (typeof document === "undefined") return null;
    return (
        document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${name}=`))
            ?.split("=")[1] || null
    );
};
