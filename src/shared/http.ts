export class RequestError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, RequestError);
  }
}

export function get<P>(url: string, signal: AbortSignal): Promise<P> {
  return fetch(url, {
    method: "get",
    headers: { "Content-Type": "application/json" },
    signal,
  }).then((res) =>
    res
      .json()
      .then((data) =>
        res.ok
          ? data
          : Promise.reject(new RequestError(res.status, data.error.message))
      )
  );
}
