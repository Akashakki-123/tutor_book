export interface FormatterResult<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

export function returnFormatter<T = unknown>(
  status: boolean,
  message: string,
  data?: T
): FormatterResult<T> {
  return { status, message, data };
}

