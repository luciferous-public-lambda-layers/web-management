import dayjs from "dayjs";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export function generateCurrentDatetime(): string {
  const dt = dayjs().tz("Asia/Tokyo");
  return dt.format("YYYY-MM-DDTHH:mm:ss.SSS000Z");
}
