import { render, screen } from "@testing-library/react";
import { SignIn } from "../components/SignIn/SignIn";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }) }));

describe("SignIn", () => {
  it("offers one sign-in form and no role selection", () => {
    render(<SignIn next={null} />);
    expect(screen.getByRole("heading", { level: 1, name: /Sign in to OpsPilot/ })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/email/i)).toHaveLength(1);
    expect(screen.queryByText(/gateway/i)).toBeNull();
  });
});
