import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast, type ToastInput } from "../ToastProvider";

function Trigger({ toast }: { toast: ToastInput }) {
  const { notify } = useToast();
  return <button onClick={() => notify(toast)}>go</button>;
}
const show = (toast: ToastInput) => render(<ToastProvider><Trigger toast={toast} /></ToastProvider>);

describe("Toast", () => {
  afterEach(() => vi.useRealTimers());

  it("announces errors assertively with a technical reference, and successes politely", async () => {
    show({ tone: "error", title: "Sync failed", message: "GitHub did not accept the request.", reference: "502 upstream_error" });
    await userEvent.click(screen.getByRole("button", { name: "go" }));
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Sync failed");
    expect(alert).toHaveTextContent("Reference: 502 upstream_error");
  });

  it("uses role=status for success", async () => {
    show({ tone: "success", title: "Saved" });
    await userEvent.click(screen.getByRole("button", { name: "go" }));
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("can be dismissed with the keyboard-reachable close button", async () => {
    show({ tone: "info", title: "FYI" });
    await userEvent.click(screen.getByRole("button", { name: "go" }));
    await userEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("FYI")).toBeNull();
  });

  it("dismisses successes after 5s but keeps errors for 10s", () => {
    vi.useFakeTimers();
    const { rerender } = render(<ToastProvider><Trigger toast={{ tone: "success", title: "OK" }} /></ToastProvider>);
    act(() => { screen.getByRole("button", { name: "go" }).click(); });
    act(() => { vi.advanceTimersByTime(4900); });
    expect(screen.getByText("OK")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText("OK")).toBeNull();
    rerender(<ToastProvider><Trigger toast={{ tone: "error", title: "Bad" }} /></ToastProvider>);
    act(() => { screen.getByRole("button", { name: "go" }).click(); });
    act(() => { vi.advanceTimersByTime(9000); });
    expect(screen.getByText("Bad")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.queryByText("Bad")).toBeNull();
  });

  it("shows at most three toasts, newest last", async () => {
    show({ tone: "info", title: "T" });
    for (let i = 0; i < 5; i++) await userEvent.click(screen.getByRole("button", { name: "go" }));
    expect(screen.getAllByRole("status")).toHaveLength(3);
  });
});
