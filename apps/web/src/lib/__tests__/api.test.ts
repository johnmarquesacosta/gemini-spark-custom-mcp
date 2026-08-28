import { fetchApiUrl } from "../api";
import axios from "axios";

jest.mock("axios", () => {
  return {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
    })),
    get: jest.fn(),
    post: jest.fn(),
  };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("fetchApiUrl", () => {
  beforeEach(() => {
    // Clear mocks and reset window environment before each test
    jest.clearAllMocks();
    delete (window as any).ENV;
    process.env.NEXT_PUBLIC_API_URL = undefined;
    process.env.RUNTIME_API_URL = undefined;
  });

  it("should return window.ENV.API_URL if it is set and starts with http/https", async () => {
    (window as any).ENV = { API_URL: "https://mcp-api.johnmarques.com.br" };
    const url = await fetchApiUrl();
    expect(url).toBe("https://mcp-api.johnmarques.com.br");
  });

  it("should automatically prepend https:// to window.ENV.API_URL if missing protocol", async () => {
    (window as any).ENV = { API_URL: "mcp-api.johnmarques.com.br" };
    const url = await fetchApiUrl();
    expect(url).toBe("https://mcp-api.johnmarques.com.br");
  });

  it("should fallback to NEXT_PUBLIC_API_URL if API route fails and window.ENV is empty", async () => {
    // Mock the API route to fail
    mockedAxios.get.mockRejectedValue(new Error("Network error"));
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";

    const url = await fetchApiUrl();
    expect(url).toBe("http://localhost:4000");
  });

  it("should fetch from /api/env if window.ENV is missing and update window.ENV", async () => {
    // Mock the API route to succeed
    mockedAxios.get.mockResolvedValue({
      data: { API_URL: "https://dynamic.johnmarques.com.br" },
    });

    const url = await fetchApiUrl();
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/env");
    expect(url).toBe("https://dynamic.johnmarques.com.br");
    expect((window as any).ENV.API_URL).toBe(
      "https://dynamic.johnmarques.com.br",
    );
  });
});
