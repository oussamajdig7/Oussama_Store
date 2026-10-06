import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { WishlistProvider } from '../context/WishlistContext';
import { AuthProvider } from '../context/AuthContext';

function renderProductCard(product, onAddToCart = vi.fn()) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <WishlistProvider>
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </WishlistProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProductCard Component', () => {
  const inStockProduct = {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: 1199.99,
    stock: 10,
    category_name: 'Smartphones',
    description: 'Flagship Apple smartphone',
  };

  const outOfStockProduct = {
    id: 2,
    name: 'Vintage Mechanical Watch',
    price: 350.0,
    stock: 0,
    category_name: 'Watches',
    description: 'Rare limited edition watch',
  };

  it('renders product details correctly (name, price, category)', () => {
    renderProductCard(inStockProduct);

    expect(screen.getByText('iPhone 15 Pro Max')).toBeInTheDocument();
    expect(screen.getByText('Smartphones')).toBeInTheDocument();
    expect(screen.getByText('$1,199.99')).toBeInTheDocument();
    expect(screen.getByText(/in stock/i)).toBeInTheDocument();
  });

  it('calls onAddToCart handler when Add to Cart button is clicked', async () => {
    const handleAddToCart = vi.fn().mockResolvedValue({});
    renderProductCard(inStockProduct, handleAddToCart);

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(handleAddToCart).toHaveBeenCalledTimes(1);
    expect(handleAddToCart).toHaveBeenCalledWith(1, 1);
  });

  it('disables Add to Cart button and displays Out of Stock when stock is 0', () => {
    const handleAddToCart = vi.fn();
    renderProductCard(outOfStockProduct, handleAddToCart);

    const outOfStockElements = screen.getAllByText(/out of stock/i);
    expect(outOfStockElements.length).toBeGreaterThan(0);

    const disabledButton = screen.getByRole('button', { name: /out of stock/i });
    expect(disabledButton).toBeDisabled();

    fireEvent.click(disabledButton);
    expect(handleAddToCart).not.toHaveBeenCalled();
  });
});
