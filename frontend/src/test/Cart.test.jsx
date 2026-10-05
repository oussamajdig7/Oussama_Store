import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartItem } from '../components/CartItem';
import { CartPage } from '../pages/CartPage';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

describe('Cart Components', () => {
  const mockItem = {
    id: 10,
    product_id: 1,
    quantity: 2,
    unit_price: 100.0,
    subtotal: 200.0,
    product: {
      id: 1,
      name: 'Wireless Noise-Canceling Headphones',
      category_name: 'Audio',
      stock: 5,
    },
  };

  describe('CartItem Component', () => {
    it('renders item information and calculates formatted subtotal', () => {
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      expect(screen.getByText('Wireless Noise-Canceling Headphones')).toBeInTheDocument();
      expect(screen.getByText('Audio')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });

    it('handles quantity increment and decrement clicks', () => {
      const handleUpdate = vi.fn();
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={handleUpdate}
          onRemove={vi.fn()}
        />
      );

      const minusBtn = screen.getByTitle('Decrease quantity');
      const plusBtn = screen.getByTitle('Increase quantity');

      fireEvent.click(minusBtn);
      expect(handleUpdate).toHaveBeenCalledWith(10, 1);

      fireEvent.click(plusBtn);
      expect(handleUpdate).toHaveBeenCalledWith(10, 3);
    });

    it('disables decrease button when quantity is 1', () => {
      const singleItem = { ...mockItem, quantity: 1, subtotal: 100.0 };
      render(
        <CartItem
          item={singleItem}
          onUpdateQuantity={vi.fn()}
          onRemove={vi.fn()}
        />
      );

      const minusBtn = screen.getByTitle('Decrease quantity');
      expect(minusBtn).toBeDisabled();
    });

    it('calls onRemove when delete button is clicked', () => {
      const handleRemove = vi.fn();
      render(
        <CartItem
          item={mockItem}
          onUpdateQuantity={vi.fn()}
          onRemove={handleRemove}
        />
      );

      const removeBtn = screen.getByTitle('Remove item');
      fireEvent.click(removeBtn);
      expect(handleRemove).toHaveBeenCalledWith(10);
    });
  });

  describe('CartPage Component', () => {
    const mockAuthContext = {
      user: { id: 1, name: 'Oussama', email: 'oussama@example.com' },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
    };

    it('renders empty cart state when cart has no items', () => {
      const emptyCartContext = {
        cart: { items: [], total: 0, total_quantity: 0 },
        loading: false,
        error: null,
        updateQuantity: vi.fn(),
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
        refreshCart: vi.fn(),
      };

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <CartContext.Provider value={emptyCartContext}>
            <CartPage onNavigateToProducts={vi.fn()} onNavigateToCheckout={vi.fn()} />
          </CartContext.Provider>
        </AuthContext.Provider>
      );

      expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
      expect(
        screen.getByText(/You have not added any products to your shopping cart yet/i)
      ).toBeInTheDocument();
    });

    it('renders cart items and total with Proceed to Checkout button when items exist', () => {
      const activeCartContext = {
        cart: {
          items: [mockItem],
          total: 200.0,
          total_quantity: 2,
        },
        loading: false,
        error: null,
        updateQuantity: vi.fn(),
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
        refreshCart: vi.fn(),
      };

      const handleCheckout = vi.fn();

      render(
        <AuthContext.Provider value={mockAuthContext}>
          <CartContext.Provider value={activeCartContext}>
            <CartPage onNavigateToProducts={vi.fn()} onNavigateToCheckout={handleCheckout} />
          </CartContext.Provider>
        </AuthContext.Provider>
      );

      expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument();
      expect(screen.getByText('Wireless Noise-Canceling Headphones')).toBeInTheDocument();
      const checkoutButtons = screen.getAllByText(/proceed to checkout/i);
      expect(checkoutButtons.length).toBeGreaterThan(0);

      fireEvent.click(checkoutButtons[0]);
      expect(handleCheckout).toHaveBeenCalled();
    });
  });
});
