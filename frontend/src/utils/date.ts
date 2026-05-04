import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

export function formatDate(value: string | Date, pattern = "DD/MM/YYYY") {
  return dayjs(value).format(pattern);
}

export function formatDateTime(value: string | Date) {
  return dayjs(value).format("DD/MM/YYYY [às] HH:mm");
}