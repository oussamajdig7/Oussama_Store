import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Register } from '../components/Register';
import { AuthContext } from '../context/AuthContext';

function renderRegisterWithContext(authValues = {}, props = {}) {
  const defaultAuth = {
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn().mockResolvedValue({ success: true }),
    ...authValues,
  };

  return {
    ...render(
      <AuthContext.Provider value={defaultAuth}>
        <Register {...props} />
      </AuthContext.Provider>
    ),
    auth: defaultAuth,
  };
}

describe('Register Component', () => {
  it('renders registration form fields (name, email, password, submit button)', () => {
    renderRegisterWithContext();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('displays validation error if required fields are missing', async () => {
    const { auth } = renderRegisterWithContext();

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/all fields are required/i);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('displays validation error if password is less than 8 characters', async () => {
    const { auth } = renderRegisterWithContext();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'short' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('submits valid registration and invokes register from AuthContext', async () => {
    const onSuccess = vi.fn();
    const { auth } = renderRegisterWithContext({}, { onSuccess });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'New Shopper' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'shopper@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'SecurePassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(auth.register).toHaveBeenCalledWith({
        name: 'New Shopper',
        email: 'shopper@example.com',
        password: 'SecurePassword123!',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('displays server error message when registration fails', async () => {
    const failingRegister = vi.fn().mockRejectedValue({
      userMessage: 'A user with this email already exists.',
    });

    renderRegisterWithContext({ register: failingRegister });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Existing User' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'existing@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'ValidPass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/already exists/i);
  });
});
