import dayjs from "dayjs";
import jalaliday from "jalaliday";
import "dayjs/locale/fa";

dayjs.extend(jalaliday);

export function formatRoomLastMessageTime(messageDate) {
  if (!messageDate) return "";

  const now = dayjs();
  const msg = dayjs(messageDate);

  // اگر تاریخ نامعتبر بود
  if (!msg.isValid()) return "";

//   امروز
  if (msg.isSame(now, "day")) {
    return msg.locale("fa").format("HH:mm");
  }

  // اختلاف روز
  const diffDays = now.startOf("day").diff(msg.startOf("day"), "day");

//   توی ۷ روز اخیر
  if (diffDays >= 1 && diffDays < 7) {
    // روز هفته
    return msg.calendar("jalali").locale("fa").format("dddd");
  }

  // قدیمی‌تر: تاریخ کامل شمسی
  return msg.calendar("jalali").locale("fa").format("YYYY/MM/DD");
}

// تاریخ کامل شمسی
export function toJalaliDate(messageDate) {
  if (!messageDate) return "";
  const d = dayjs(messageDate);
  if (!d.isValid()) return "";
  return d.calendar("jalali").locale("fa").format("YYYY/MM/DD");
}

// زمان
export function toTime(messageDate) {
  if (!messageDate) return "";
  const d = dayjs(messageDate);
  if (!d.isValid()) return "";
  return d.locale("fa").format("HH:mm");
}
