import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../components/Login';
import { AuthContext } from '../context/AuthContext';

function renderLoginWithContext(authValues = {}, props = {}) {
  const defaultAuth = {
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn(),
    register: vi.fn(),
    ...authValues,
  };

  return {
    ...render(
      <AuthContext.Provider value={defaultAuth}>
        <Login {...props} />
      </AuthContext.Provider>
    ),
    auth: defaultAuth,
  };
}

describe('Login Component', () => {
  it('renders login form with email, password fields and sign in button', () => {
    renderLoginWithContext();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays client validation error when submitting with empty fields', async () => {
    const { auth } = renderLoginWithContext();

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/please enter both email and password/i);
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('submits valid credentials and calls login from AuthContext', async () => {
    const onSuccess = vi.fn();
    const { auth } = renderLoginWithContext({}, { onSuccess });

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'oussama@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: 'oussama@example.com',
        password: 'Password123!',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('displays error message when login rejects with an error', async () => {
    const failingLogin = vi.fn().mockRejectedValue({
      userMessage: 'Invalid email or password.',
    });

    renderLoginWithContext({ login: failingLogin });

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'WrongPass!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email or password/i);
  });
});
