import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

export function normalizeToUtcDate(value: Date | string) {
  return dayjs(value).utc().toDate();
}

export function serializeDates<T>(value: T): T {
  if (value instanceof Date) {
    return dayjs(value).utc().toISOString() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeDates(item)) as T;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, serializeDates(item)])
  ) as T;
}