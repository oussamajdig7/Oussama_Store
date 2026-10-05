import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CartContext } from '../context/CartContext';
import * as orderService from '../services/orderService';

// Mock the orderService
vi.mock('../services/orderService', () => ({
  createOrder: vi.fn(),
}));

describe('CheckoutPage Component', () => {
  const mockCartItem = {
    id: 1,
    product_id: 10,
    quantity: 2,
    unit_price: 150.0,
    subtotal: 300.0,
    product: {
      id: 10,
      name: 'Wireless Ergonomic Keyboard',
      stock: 12,
    },
  };

  const defaultCartContext = {
    cart: {
      items: [mockCartItem],
      total: 300.0,
      total_quantity: 2,
    },
    refreshCart: vi.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty checkout state when cart has no items', () => {
    const emptyContext = {
      cart: { items: [], total: 0, total_quantity: 0 },
      refreshCart: vi.fn(),
    };

    render(
      <CartContext.Provider value={emptyContext}>
        <CheckoutPage onOrderSuccess={vi.fn()} onNavigateToCart={vi.fn()} />
      </CartContext.Provider>
    );

    expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
  });

  it('renders shipping address form and order summary when items are in cart', () => {
    const { container } = render(
      <CartContext.Provider value={defaultCartContext}>
        <CheckoutPage onOrderSuccess={vi.fn()} onNavigateToCart={vi.fn()} />
      </CartContext.Provider>
    );

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    expect(container.querySelector('input[name="fullName"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="street"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="city"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="phone"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm & place order/i })).toBeInTheDocument();
  });

  it('displays validation error if required address fields are missing on submit', async () => {
    const { container } = render(
      <CartContext.Provider value={defaultCartContext}>
        <CheckoutPage onOrderSuccess={vi.fn()} onNavigateToCart={vi.fn()} />
      </CartContext.Provider>
    );

    const form = container.querySelector('form');
    fireEvent.submit(form);

    expect(
      await screen.findByText(/please fill in all required shipping address fields/i)
    ).toBeInTheDocument();
    expect(orderService.createOrder).not.toHaveBeenCalled();
  });

  it('submits order successfully when all required fields are filled', async () => {
    const onOrderSuccess = vi.fn();
    const createdOrder = {
      id: 99,
      total: 300.0,
      status: 'pending',
      shipping_address: 'Oussama J, Street 1, Casablanca 20000, Morocco (Tel: 0600000000)',
    };
    orderService.createOrder.mockResolvedValueOnce({ data: createdOrder });

    const { container } = render(
      <CartContext.Provider value={defaultCartContext}>
        <CheckoutPage onOrderSuccess={onOrderSuccess} onNavigateToCart={vi.fn()} />
      </CartContext.Provider>
    );

    const nameInput = container.querySelector('input[name="fullName"]');
    const streetInput = container.querySelector('input[name="street"]');
    const cityInput = container.querySelector('input[name="city"]');
    const zipInput = container.querySelector('input[name="postalCode"]');
    const phoneInput = container.querySelector('input[name="phone"]');
    const form = container.querySelector('form');

    fireEvent.change(nameInput, { target: { name: 'fullName', value: 'Oussama J' } });
    fireEvent.change(streetInput, { target: { name: 'street', value: 'Street 1' } });
    fireEvent.change(cityInput, { target: { name: 'city', value: 'Casablanca' } });
    fireEvent.change(zipInput, { target: { name: 'postalCode', value: '20000' } });
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '0600000000' } });

    fireEvent.submit(form);

    await waitFor(() => {
      expect(orderService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          shipping_address: expect.stringContaining('Oussama J'),
        })
      );
      expect(defaultCartContext.refreshCart).toHaveBeenCalled();
      expect(onOrderSuccess).toHaveBeenCalledWith(createdOrder);
    });
  });
});
