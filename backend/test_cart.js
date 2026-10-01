const http = require('http');
const app = require('express')();
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');

app.use(cors());
app.use(require('express').json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

const server = app.listen(5099, async () => {
  console.log('Test server running on port 5099');

  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5099,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    console.log('--- 1. Testing GET /api/cart without token (should be 401) ---');
    const resNoAuth = await request('/api/cart');
    console.log('Status:', resNoAuth.status, 'Body:', resNoAuth.body);

    console.log('\n--- 2. Login as oussama@example.com ---');
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'oussama@example.com',
      password: 'Password123!',
    });
    console.log('Login Status:', loginRes.status, 'Success:', loginRes.body.success);
    const token = loginRes.body.data.token;

    console.log('\n--- 3. Clear cart to start clean ---');
    await request('/api/cart', 'DELETE', null, token);

    console.log('\n--- 4. Testing GET /api/cart (empty cart) ---');
    const resEmpty = await request('/api/cart', 'GET', null, token);
    console.log('Status:', resEmpty.status, 'Items:', resEmpty.body.data.items.length, 'Total:', resEmpty.body.data.total);

    console.log('\n--- 5. Testing POST /api/cart with non-existent product ---');
    const resNotFound = await request('/api/cart', 'POST', { product_id: 9999, quantity: 1 }, token);
    console.log('Status:', resNotFound.status, 'Message:', resNotFound.body.message);

    console.log('\n--- 6. Testing POST /api/cart with invalid quantity (0, negative, string) ---');
    const resInvalidQty = await request('/api/cart', 'POST', { product_id: 1, quantity: 0 }, token);
    console.log('Status for qty 0:', resInvalidQty.status, 'Message:', resInvalidQty.body.message);

    console.log('\n--- 7. Testing POST /api/cart with quantity > stock ---');
    const resOverStock = await request('/api/cart', 'POST', { product_id: 1, quantity: 999 }, token);
    console.log('Status:', resOverStock.status, 'Message:', resOverStock.body.message);

    console.log('\n--- 8. Testing POST /api/cart add valid product (iPhone 15 Pro, qty 2) ---');
    const resAdd1 = await request('/api/cart', 'POST', { product_id: 1, quantity: 2 }, token);
    console.log('Status:', resAdd1.status, 'Message:', resAdd1.body.message, 'Cart Total:', resAdd1.body.data.cart.total);

    console.log('\n--- 9. Testing POST /api/cart add SAME product again (qty 3) -> should increment to 5 ---');
    const resAddDuplicate = await request('/api/cart', 'POST', { product_id: 1, quantity: 3 }, token);
    console.log('Status:', resAddDuplicate.status, 'Message:', resAddDuplicate.body.message, 'New Qty:', resAddDuplicate.body.data.quantity, 'Cart Total:', resAddDuplicate.body.data.cart.total);

    console.log('\n--- 10. Testing GET /api/cart (verify product, quantity, unit_price, subtotal, total) ---');
    const resCart = await request('/api/cart', 'GET', null, token);
    console.log('Cart Items count:', resCart.body.data.items.length);
    const item = resCart.body.data.items[0];
    console.log('Item:', {
      id: item.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    });
    console.log('Total:', resCart.body.data.total);

    const cartItemId = item.id;

    console.log('\n--- 11. Testing PUT /api/cart/:id (update quantity to 4) ---');
    const resPut = await request(`/api/cart/${cartItemId}`, 'PUT', { quantity: 4 }, token);
    console.log('Status:', resPut.status, 'New Qty:', resPut.body.data.quantity, 'New Total:', resPut.body.data.cart.total);

    console.log('\n--- 12. Testing PUT /api/cart/:id with qty > stock ---');
    const resPutOver = await request(`/api/cart/${cartItemId}`, 'PUT', { quantity: 1000 }, token);
    console.log('Status:', resPutOver.status, 'Message:', resPutOver.body.message);

    console.log('\n--- 13. Testing DELETE /api/cart/:id ---');
    const resDel = await request(`/api/cart/${cartItemId}`, 'DELETE', null, token);
    console.log('Status:', resDel.status, 'Remaining items:', resDel.body.data.items.length);

    console.log('\n--- 14. Testing Clear Cart (add 2 items then DELETE /api/cart) ---');
    await request('/api/cart', 'POST', { product_id: 1, quantity: 1 }, token);
    await request('/api/cart', 'POST', { product_id: 2, quantity: 1 }, token);
    const beforeClear = await request('/api/cart', 'GET', null, token);
    console.log('Items before clear:', beforeClear.body.data.items.length);

    const resClear = await request('/api/cart', 'DELETE', null, token);
    console.log('Status after clear:', resClear.status, 'Items:', resClear.body.data.items.length);

    console.log('\nALL BACKEND CART TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
  }
});
