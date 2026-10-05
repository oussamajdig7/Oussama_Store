import assert from 'node:assert';
import { authReducer, AUTH_ACTIONS, initialAuthState } from './src/context/reducers/authReducer.js';
import { cartReducer, CART_ACTIONS, initialCartState } from './src/context/reducers/cartReducer.js';
import { wishlistReducer, WISHLIST_ACTIONS, initialWishlistState } from './src/context/reducers/wishlistReducer.js';

console.log('=== STARTING PHASE 16 STATE MANAGEMENT TESTS ===\n');

// ----------------------------------------------------
// TEST 1: AuthReducer transitions
// ----------------------------------------------------
console.log('[Test 1] Testing AuthReducer transitions...');

// 1.1 AUTH_START
let authState = authReducer(initialAuthState, { type: AUTH_ACTIONS.AUTH_START });
assert.strictEqual(authState.loading, true);
assert.strictEqual(authState.error, null);

// 1.2 AUTH_SUCCESS
const mockUser = { id: 1, name: 'Oussama', email: 'oussama@example.com', role: 'admin' };
authState = authReducer(authState, { type: AUTH_ACTIONS.AUTH_SUCCESS, payload: mockUser });
assert.strictEqual(authState.loading, false);
assert.strictEqual(authState.isAuthenticated, true);
assert.deepStrictEqual(authState.user, mockUser);
assert.strictEqual(authState.error, null);

// 1.3 SET_USER
const updatedUser = { ...mockUser, name: 'Oussama Updated' };
authState = authReducer(authState, { type: AUTH_ACTIONS.SET_USER, payload: updatedUser });
assert.strictEqual(authState.user.name, 'Oussama Updated');

// 1.4 LOGOUT
authState = authReducer(authState, { type: AUTH_ACTIONS.LOGOUT });
assert.strictEqual(authState.user, null);
assert.strictEqual(authState.isAuthenticated, false);
assert.strictEqual(authState.loading, false);

// 1.5 AUTH_FAILURE
authState = authReducer(authState, { type: AUTH_ACTIONS.AUTH_FAILURE, payload: 'Invalid credentials' });
assert.strictEqual(authState.user, null);
assert.strictEqual(authState.isAuthenticated, false);
assert.strictEqual(authState.loading, false);
assert.strictEqual(authState.error, 'Invalid credentials');
console.log('PASS: AuthReducer handles START, SUCCESS, SET_USER, LOGOUT, and FAILURE correctly.\n');

// ----------------------------------------------------
// TEST 2: CartReducer transitions
// ----------------------------------------------------
console.log('[Test 2] Testing CartReducer transitions...');

// 2.1 SET_LOADING
let cartState = cartReducer(initialCartState, { type: CART_ACTIONS.SET_LOADING, payload: true });
assert.strictEqual(cartState.loading, true);

// 2.2 SET_CART
const mockCartData = {
  items: [
    { id: 10, product_id: 1, quantity: 2, unit_price: 99.99, subtotal: 199.98, product: { name: 'Item 1' } },
    { id: 11, product_id: 2, quantity: 1, unit_price: 50.00, subtotal: 50.00, product: { name: 'Item 2' } },
  ],
  total_quantity: 3,
  total: 249.98,
};
cartState = cartReducer(cartState, { type: CART_ACTIONS.SET_CART, payload: mockCartData });
assert.strictEqual(cartState.loading, false);
assert.strictEqual(cartState.error, null);
assert.strictEqual(cartState.cart.items.length, 2);
assert.strictEqual(cartState.cart.total_quantity, 3);
assert.strictEqual(cartState.cart.total, 249.98);

// 2.3 CLEAR_CART
cartState = cartReducer(cartState, { type: CART_ACTIONS.CLEAR_CART });
assert.strictEqual(cartState.cart.items.length, 0);
assert.strictEqual(cartState.cart.total_quantity, 0);
assert.strictEqual(cartState.cart.total, 0);

// 2.4 SET_ERROR
cartState = cartReducer(cartState, { type: CART_ACTIONS.SET_ERROR, payload: 'Cart error occurred' });
assert.strictEqual(cartState.error, 'Cart error occurred');
assert.strictEqual(cartState.loading, false);
console.log('PASS: CartReducer handles SET_LOADING, SET_CART, CLEAR_CART, and SET_ERROR correctly.\n');

// ----------------------------------------------------
// TEST 3: WishlistReducer transitions
// ----------------------------------------------------
console.log('[Test 3] Testing WishlistReducer transitions...');

// 3.1 SET_LOADING
let wishlistState = wishlistReducer(initialWishlistState, { type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
assert.strictEqual(wishlistState.loading, true);

// 3.2 SET_WISHLIST
const mockWishlist = [
  { id: 101, product_id: 5, product: { id: 5, name: 'Phone' } },
  { id: 102, product_id: 6, product: { id: 6, name: 'Headphones' } },
];
wishlistState = wishlistReducer(wishlistState, { type: WISHLIST_ACTIONS.SET_WISHLIST, payload: mockWishlist });
assert.strictEqual(wishlistState.loading, false);
assert.strictEqual(wishlistState.items.length, 2);

// 3.3 ADD_ITEM
const newItem = { id: 103, product_id: 7, product: { id: 7, name: 'Laptop' } };
wishlistState = wishlistReducer(wishlistState, { type: WISHLIST_ACTIONS.ADD_ITEM, payload: newItem });
assert.strictEqual(wishlistState.items.length, 3);
assert.strictEqual(wishlistState.items[0].product_id, 7);

// 3.4 Duplicate ADD_ITEM is ignored
wishlistState = wishlistReducer(wishlistState, { type: WISHLIST_ACTIONS.ADD_ITEM, payload: newItem });
assert.strictEqual(wishlistState.items.length, 3, 'Duplicate item should not be added');

// 3.5 REMOVE_ITEM (by product_id)
wishlistState = wishlistReducer(wishlistState, { type: WISHLIST_ACTIONS.REMOVE_ITEM, payload: 7 });
assert.strictEqual(wishlistState.items.length, 2);
assert.ok(!wishlistState.items.some((item) => item.product_id === 7));

// 3.6 CLEAR_WISHLIST
wishlistState = wishlistReducer(wishlistState, { type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
assert.strictEqual(wishlistState.items.length, 0);

// 3.7 SET_ERROR
wishlistState = wishlistReducer(wishlistState, { type: WISHLIST_ACTIONS.SET_ERROR, payload: 'Wishlist error' });
assert.strictEqual(wishlistState.error, 'Wishlist error');
console.log('PASS: WishlistReducer handles SET_LOADING, SET_WISHLIST, ADD_ITEM (deduped), REMOVE_ITEM, and CLEAR_WISHLIST correctly.\n');

console.log('=== ALL PHASE 16 REDUCER TESTS PASSED SUCCESSFULLY! ===');
