import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PostEditor } from "./PostEditor";
import { createPost } from "../../app/actions/posts";
import { useRouter } from "next/navigation";

jest.mock("../../app/actions/posts", () => ({
  createPost: jest.fn(),
  updatePost: jest.fn(),
  publishPost: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("PostEditor", () => {
  const mockRouter = { push: jest.fn(), refresh: jest.fn() };
  const mockCategories = [{ id: "c1", name: "Tech", slug: "tech" }];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders in create mode", () => {
    render(<PostEditor categories={mockCategories} />);
    
    expect(screen.getByPlaceholderText(/Enter a striking headline/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save Draft/i })).toBeInTheDocument();
  });

  it("renders in edit mode and allows publishing", () => {
    const post = {
      id: "p1",
      title: "My Post",
      slug: "my-post",
      blocks: [{ id: "b1", type: "TEXT", textContent: "Content here", order: 0 }],
      excerpt: "Excerpt",
      status: "DRAFT",
      metaTitle: "Meta",
      metaDescription: "Meta desc",
      focusKeyword: "keyword",
      categoryId: "c1",
      language: "pt",
    };
    
    render(<PostEditor categories={mockCategories} post={post as unknown as import("./PostEditor").Post} />);
    
    expect(screen.getByDisplayValue("My Post")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Publish/i })).toBeInTheDocument();
  });

  it("submits the form to create a post", async () => {
    (createPost as jest.Mock).mockResolvedValueOnce({ id: "p2" });
    render(<PostEditor categories={mockCategories} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter a striking headline/i), { target: { value: "New Post" } });
    fireEvent.change(screen.getByPlaceholderText(/Url slug/i), { target: { value: "new-post" } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: "c1" } });
    
    // Simulate content, excerpt, and meta fields...
    fireEvent.click(screen.getByRole("button", { name: /Add Text/i }));
    fireEvent.change(screen.getByPlaceholderText(/Write your content here/i), { target: { value: "Post content here" } });

    fireEvent.change(screen.getByLabelText(/Excerpt/i), { target: { value: "Short excerpt" } });
    fireEvent.change(screen.getByLabelText(/Meta Title/i), { target: { value: "A Meta title that is long enough" } });
    fireEvent.change(screen.getByLabelText(/Meta Description/i), { target: { value: "A Meta description that is long enough to pass validation rules easily" } });
    fireEvent.change(screen.getByLabelText(/Focus Keyword/i), { target: { value: "key" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Draft/i }));
    
    await waitFor(() => {
      expect(createPost).toHaveBeenCalledWith(expect.objectContaining({
        title: "New Post",
        slug: "new-post",
        categoryId: "c1",
        status: "DRAFT",
      }));
      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/posts");
    });
  });
});
