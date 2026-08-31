import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createCategory, updateCategory } from "../../app/actions/categories";
import { useRouter } from "next/navigation";
import { CategoryEditor } from "./CategoryEditor";

// Mock the server actions
jest.mock("../../app/actions/categories", () => ({
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
}));

// Mock the router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("CategoryEditor", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders correctly in create mode", () => {
    render(<CategoryEditor />);
    
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Slug/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Category/i })).toBeInTheDocument();
  });

  it("renders correctly in edit mode", () => {
    const category = { id: "1", name: "Tech", slug: "tech", wordpressCategoryId: 10 };
    render(<CategoryEditor category={category} />);
    
    expect(screen.getByDisplayValue("Tech")).toBeInTheDocument();
    expect(screen.getByDisplayValue("tech")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save Changes/i })).toBeInTheDocument();
  });

  it("submits the form and calls createCategory in create mode", async () => {
    (createCategory as jest.Mock).mockResolvedValueOnce({ id: "2" });

    render(<CategoryEditor />);
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "New Category" } });
    fireEvent.change(screen.getByLabelText(/Slug/i), { target: { value: "new-category" } });
    
    fireEvent.click(screen.getByRole("button", { name: /Create Category/i }));
    
    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith({
        name: "New Category",
        slug: "new-category",
        wordpressCategoryId: undefined,
      });
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/categories");
    });
  });

  it("submits the form and calls updateCategory in edit mode", async () => {
    (updateCategory as jest.Mock).mockResolvedValueOnce({ id: "1" });
    const category = { id: "1", name: "Tech", slug: "tech", wordpressCategoryId: 10 };

    render(<CategoryEditor category={category} />);
    
    fireEvent.change(screen.getByDisplayValue("Tech"), { target: { value: "Updated Tech" } });
    
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));
    
    await waitFor(() => {
      expect(updateCategory).toHaveBeenCalledWith("1", {
        name: "Updated Tech",
        slug: "tech",
        wordpressCategoryId: 10,
      });
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/categories");
    });
  });
});
