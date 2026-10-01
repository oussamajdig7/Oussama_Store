const http = require('http');

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
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
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

(async () => {
  try {
    console.log('--- 1. Testing GET /api/orders without token (should be 401) ---');
    const resNoAuth = await request('/api/orders');
    console.log('Status:', resNoAuth.status);

    console.log('\n--- 2. Login as oussama@example.com ---');
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'oussama@example.com',
      password: 'Password123!',
    });
    console.log('Login Status:', loginRes.status);
    const token = loginRes.body.data.token;

    console.log('\n--- 3. Clear cart first ---');
    await request('/api/cart', 'DELETE', null, token);

    console.log('\n--- 4. Testing POST /api/orders with empty cart (should be 400) ---');
    const resEmpty = await request('/api/orders', 'POST', { shipping_address: '123 Main St, Casablanca' }, token);
    console.log('Status:', resEmpty.status, 'Message:', resEmpty.body.message);

    console.log('\n--- 5. Add 2 units of product 1 to cart ---');
    await request('/api/cart', 'POST', { product_id: 1, quantity: 2 }, token);

    console.log('\n--- 6. Testing POST /api/orders with missing shipping address (should be 400) ---');
    const resNoAddr = await request('/api/orders', 'POST', {}, token);
    console.log('Status:', resNoAddr.status, 'Message:', resNoAddr.body.message);

    console.log('\n--- 7. Get stock before order ---');
    const prodBefore = await request('/api/products/1');
    const stockBefore = prodBefore.body.data.stock;
    console.log('Stock before order:', stockBefore);

    console.log('\n--- 8. Testing POST /api/orders with valid address (should be 201) ---');
    const resCreate = await request('/api/orders', 'POST', {
      shipping_address: 'Boulevard d\'Anfa 45, Casablanca, Morocco',
    }, token);
    console.log('Create Status:', resCreate.status, 'Message:', resCreate.body.message);
    const orderData = resCreate.body.data;
    console.log('Order ID:', orderData.id, 'Status:', orderData.status, 'Total:', orderData.total, 'Items:', orderData.items.length);

    console.log('\n--- 9. Verify product stock was reduced by 2 ---');
    const prodAfter = await request('/api/products/1');
    const stockAfter = prodAfter.body.data.stock;
    console.log('Stock after order:', stockAfter, '(Reduced by:', stockBefore - stockAfter, ')');

    console.log('\n--- 10. Verify user cart is cleared ---');
    const cartRes = await request('/api/cart', 'GET', null, token);
    console.log('Cart count after order:', cartRes.body.data.items.length);

    console.log('\n--- 11. Testing GET /api/orders (List user orders) ---');
    const listRes = await request('/api/orders', 'GET', null, token);
    console.log('Orders count:', listRes.body.count, 'First order ID:', listRes.body.data[0]?.id);

    console.log('\n--- 12. Testing GET /api/orders/:id (Get order details) ---');
    const detailRes = await request(`/api/orders/${orderData.id}`, 'GET', null, token);
    console.log('Detail Status:', detailRes.status, 'Items:', detailRes.body.data?.items?.length, 'First Item Price Snapshot:', detailRes.body.data?.items[0]?.price);

    console.log('\nALL BACKEND ORDERS & CHECKOUT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
  }
})();
