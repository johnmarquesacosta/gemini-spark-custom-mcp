import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsentClient } from './client';
import * as actions from '../../actions/oauth';

// Mock the server actions
jest.mock('../../actions/oauth', () => ({
  approveAuthorization: jest.fn(),
}));

describe('ConsentClient', () => {
  const mockProps = {
    client_id: 'test-client',
    redirect_uri: 'http://localhost:3000/callback',
    state: 'abc',
    code_challenge: 'challenge123',
  };

  const originalLocation = window.location;

  beforeAll(() => {
    // @ts-expect-error - overriding window.location for tests
    delete window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '' },
      writable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '' },
      writable: true,
    });
  });

  it('renders correctly', () => {
    render(<ConsentClient {...mockProps} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Authorize')).toBeInTheDocument();
  });

  it('handles deny action correctly', () => {
    render(<ConsentClient {...mockProps} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(window.location.href).toBe('http://localhost:3000/callback?error=access_denied&state=abc');
  });

  it('handles deny action correctly without state', () => {
    render(<ConsentClient {...mockProps} state={undefined} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(window.location.href).toBe('http://localhost:3000/callback?error=access_denied');
  });

  it('handles approve action successfully', async () => {
    const mockRedirectUrl = 'http://localhost:3000/callback?code=auth-code';
    (actions.approveAuthorization as jest.Mock).mockResolvedValue(mockRedirectUrl);

    render(<ConsentClient {...mockProps} />);

    fireEvent.click(screen.getByText('Authorize'));

    // Should disable buttons while loading
    expect(screen.getByText('Approving...')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();

    await waitFor(() => {
      expect(actions.approveAuthorization).toHaveBeenCalledWith({
        client_id: 'test-client',
        redirect_uri: 'http://localhost:3000/callback',
        code_challenge: 'challenge123',
      });
      expect(window.location.href).toBe('http://localhost:3000/callback?code=auth-code&state=abc');
    });
  });

  it('handles approve action error', async () => {
    (actions.approveAuthorization as jest.Mock).mockRejectedValue(new Error('Failed to authorize'));

    render(<ConsentClient {...mockProps} />);

    fireEvent.click(screen.getByText('Authorize'));

    await waitFor(() => {
      expect(screen.getByText('Failed to authorize')).toBeInTheDocument();
    });

    // Buttons should be re-enabled
    expect(screen.getByText('Authorize')).not.toBeDisabled();
    expect(screen.getByText('Cancel')).not.toBeDisabled();
  });
});
