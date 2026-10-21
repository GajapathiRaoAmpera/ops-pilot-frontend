import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../components/LoginForm/LoginForm";

const replace = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

beforeEach(() => {
  replace.mockReset();
  refresh.mockReset();
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

async function fill(email = "dev@acme.io", password = "s3cret-pass") {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText("Work email"), email);
  if (password) await user.type(screen.getByLabelText("Password"), password);
  return user;
}

describe("LoginForm", () => {
  it("has labelled fields and an accessible submit button", () => {
    render(<LoginForm next={null} />);
    expect(screen.getByLabelText("Work email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  it("validates empty and malformed input without calling the API", async () => {
    render(<LoginForm next={null} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Enter your work email.")).toBeInTheDocument();
    expect(screen.getByLabelText("Work email")).toHaveAttribute("aria-invalid", "true");

    await user.type(screen.getByLabelText("Work email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("requires a password", async () => {
    render(<LoginForm next={null} />);
    const user = await fill("dev@acme.io", "");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    render(<LoginForm next={null} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("redirects to the server-provided destination on success", async () => {
    vi.mocked(fetch).mockResolvedValue(json({ redirectTo: "/audit" }));
    render(<LoginForm next="/pipelines" />);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/audit"));
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(JSON.parse(init!.body as string)).toEqual({ email: "dev@acme.io", password: "s3cret-pass", next: "/pipelines" });
    expect(screen.getByRole("button", { name: /Signed in/ })).toBeDisabled();
  });

  it("shows a generic message for invalid credentials and re-enables the form", async () => {
    vi.mocked(fetch).mockResolvedValue(json({ error: "invalid_credentials" }, 401));
    render(<LoginForm next={null} />);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The email or password is incorrect.");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("reports service failures without backend details", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("ECONNREFUSED 10.0.0.5:8000"));
    render(<LoginForm next={null} />);
    const user = await fill();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("temporarily unavailable");
    expect(alert).not.toHaveTextContent("ECONNREFUSED");
  });

  it("shows a loading state and prevents duplicate submissions", async () => {
    let resolve!: (r: Response) => void;
    vi.mocked(fetch).mockReturnValue(new Promise((r) => (resolve = r)));
    render(<LoginForm next={null} />);
    const user = await fill();
    const button = screen.getByRole("button", { name: "Sign in" });
    await user.click(button);
    await user.type(screen.getByLabelText("Password"), "{Enter}"); // disabled field: ignored
    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Signing in…" }));
    expect(fetch).toHaveBeenCalledTimes(1);
    resolve(json({ redirectTo: "/overview" }));
    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
  });

  it("shows the session-expired notice", () => {
    render(<LoginForm next={null} notice="Your session has expired. Please sign in again." />);
    expect(screen.getByRole("status")).toHaveTextContent("session has expired");
  });
});
