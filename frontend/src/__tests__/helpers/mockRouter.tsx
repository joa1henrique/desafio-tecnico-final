export const mockNavigate = jest.fn();

jest.mock("@tanstack/react-router", () => ({
  ...jest.requireActual("@tanstack/react-router"),
  useNavigate: () => mockNavigate,
  useParams: jest.fn().mockReturnValue({}),
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

export function mockUseParams(params: Record<string, string>) {
  const router = require("@tanstack/react-router");
  router.useParams.mockReturnValue(params);
}

export function resetRouterMocks() {
  mockNavigate.mockReset();
}
