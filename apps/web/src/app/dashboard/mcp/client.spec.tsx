import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { McpDashboardClient } from './client';
import * as actions from '../../actions/mcp';

// Mock the server actions
jest.mock('../../actions/mcp', () => ({
  createTool: jest.fn(),
  deleteTool: jest.fn(),
  createPrompt: jest.fn(),
  deletePrompt: jest.fn(),
}));

describe('McpDashboardClient', () => {
  const mockTools = [
    { id: '1', name: 'Test Tool', description: 'A test tool', inputSchema: {} },
  ];

  const mockPrompts = [
    { id: '1', name: 'Test Prompt', description: 'A test prompt', content: 'You are an AI' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true); // Mock confirm to always return true
  });

  it('renders correctly with initial data', () => {
    render(<McpDashboardClient initialTools={mockTools} initialPrompts={mockPrompts} />);

    // Check if tabs are rendered
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Prompts')).toBeInTheDocument();

    // Check if initial tools are listed
    expect(screen.getByText('Test Tool')).toBeInTheDocument();
    expect(screen.getByText('A test tool')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    render(<McpDashboardClient initialTools={mockTools} initialPrompts={mockPrompts} />);

    // Initially in Tools tab, should see tool form
    expect(screen.getByText('Create New Tool')).toBeInTheDocument();

    // Switch to Prompts tab
    fireEvent.click(screen.getByText('Prompts'));

    // Should see prompt form
    expect(screen.getByText('Create New Prompt')).toBeInTheDocument();
    
    // Should see initial prompts
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('A test prompt')).toBeInTheDocument();
  });

  it('creates a new tool', async () => {
    const user = userEvent.setup();
    const newTool = { id: '2', name: 'New Tool', description: 'Desc', inputSchema: {} };
    (actions.createTool as jest.Mock).mockResolvedValue(newTool);

    render(<McpDashboardClient initialTools={[]} initialPrompts={[]} />);

    await user.type(screen.getByPlaceholderText('my-tool-name'), 'New Tool');
    await user.type(screen.getByPlaceholderText('What does this tool do?'), 'Desc');
    
    fireEvent.click(screen.getByText('Create Tool'));

    await waitFor(() => {
      expect(actions.createTool).toHaveBeenCalledWith({
        name: 'New Tool',
        description: 'Desc',
        inputSchema: {}
      });
      expect(screen.getByText('New Tool')).toBeInTheDocument();
    });
  });

  it('deletes a tool', async () => {
    (actions.deleteTool as jest.Mock).mockResolvedValue(true);

    render(<McpDashboardClient initialTools={mockTools} initialPrompts={[]} />);

    expect(screen.getByText('Test Tool')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(actions.deleteTool).toHaveBeenCalledWith('1');
      expect(screen.queryByText('Test Tool')).not.toBeInTheDocument();
    });
  });

  it('creates a new prompt', async () => {
    const user = userEvent.setup();
    const newPrompt = { id: '2', name: 'New Prompt', description: 'Desc', content: 'Content' };
    (actions.createPrompt as jest.Mock).mockResolvedValue(newPrompt);

    render(<McpDashboardClient initialTools={[]} initialPrompts={[]} />);

    fireEvent.click(screen.getByText('Prompts'));

    await user.type(screen.getByPlaceholderText('my-prompt-name'), 'New Prompt');
    await user.type(screen.getByPlaceholderText('What is this prompt for?'), 'Desc');
    await user.type(screen.getByPlaceholderText('You are a helpful assistant...'), 'Content');
    
    fireEvent.click(screen.getByText('Create Prompt'));

    await waitFor(() => {
      expect(actions.createPrompt).toHaveBeenCalledWith({
        name: 'New Prompt',
        description: 'Desc',
        content: 'Content'
      });
      expect(screen.getByText('New Prompt')).toBeInTheDocument();
    });
  });

  it('deletes a prompt', async () => {
    (actions.deletePrompt as jest.Mock).mockResolvedValue(true);

    render(<McpDashboardClient initialTools={[]} initialPrompts={mockPrompts} />);

    fireEvent.click(screen.getByText('Prompts'));
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(actions.deletePrompt).toHaveBeenCalledWith('1');
      expect(screen.queryByText('Test Prompt')).not.toBeInTheDocument();
    });
  });
});
