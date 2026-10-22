import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../components/LoginForm/LoginForm";
import { RobotAgent } from "../components/RobotAgent/RobotAgent";
import { onLoginMood, type LoginMoodDetail } from "../login-mood";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("sign-in robot moods", () => {
  let seen: LoginMoodDetail[];
  let off: () => void;
  beforeEach(() => { seen = []; off = onLoginMood((d) => seen.push(d)); vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { off(); vi.unstubAllGlobals(); });

  it("follows focus and never receives what was typed", async () => {
    const user = userEvent.setup();
    render(<LoginForm next={null} />);
    await user.type(screen.getByLabelText("Work email"), "dev@acme.io");
    await user.type(screen.getByLabelText("Password"), "s3cret-pass");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    const moods = seen.map((d) => d.mood);
    expect(moods).toContain("email");
    expect(moods).toContain("password");
    expect(moods.at(-1)).toBe("peek");
    const sent = JSON.stringify(seen);
    expect(sent).not.toContain("dev@acme.io");
    expect(sent).not.toContain("s3cret");
    expect(seen.every((d) => d.look === undefined || (d.look >= 0 && d.look <= 1))).toBe(true);
  });

  it("reacts to a failed sign-in", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({ error: "invalid_credentials" }, 401));
    const user = userEvent.setup();
    render(<LoginForm next={null} />);
    await user.type(screen.getByLabelText("Work email"), "dev@acme.io");
    await user.type(screen.getByLabelText("Password"), "wrong-pass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(seen.map((d) => d.mood)).toEqual(expect.arrayContaining(["thinking", "error"])));
  });

  it("stays out of the way without WebGL (jsdom has none): nothing rendered, nothing thrown", async () => {
    const { container } = render(<RobotAgent />);
    await waitFor(() => expect(container.querySelector("canvas")).toBeNull());
  });
});
