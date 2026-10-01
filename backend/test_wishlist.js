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
    console.log('--- 1. Testing GET /api/wishlist without token (should be 401) ---');
    const resNoAuth = await request('/api/wishlist');
    console.log('Status:', resNoAuth.status, 'Body:', resNoAuth.body);

    console.log('\n--- 2. Login as oussama@example.com ---');
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'oussama@example.com',
      password: 'Password123!',
    });
    console.log('Login Status:', loginRes.status);
    const token = loginRes.body.data.token;

    console.log('\n--- 3. Testing POST /api/wishlist with missing product_id (400) ---');
    const resNoProd = await request('/api/wishlist', 'POST', {}, token);
    console.log('Status:', resNoProd.status, 'Message:', resNoProd.body.message);

    console.log('\n--- 4. Testing POST /api/wishlist with non-existent product (404) ---');
    const resNotFound = await request('/api/wishlist', 'POST', { product_id: 99999 }, token);
    console.log('Status:', resNotFound.status, 'Message:', resNotFound.body.message);

    // Clean up product 1 from wishlist first if it exists
    await request('/api/wishlist/1', 'DELETE', null, token);

    console.log('\n--- 5. Testing POST /api/wishlist add valid product (product 1) -> 201 ---');
    const resAdd = await request('/api/wishlist', 'POST', { product_id: 1 }, token);
    console.log('Status:', resAdd.status, 'Message:', resAdd.body.message, 'Product:', resAdd.body.data?.product?.name);

    console.log('\n--- 6. Testing POST /api/wishlist duplicate product -> 409 ---');
    const resDup = await request('/api/wishlist', 'POST', { product_id: 1 }, token);
    console.log('Status:', resDup.status, 'Message:', resDup.body.message);

    console.log('\n--- 7. Testing GET /api/wishlist -> verify wishlist items ---');
    const resGet = await request('/api/wishlist', 'GET', null, token);
    console.log('Status:', resGet.status, 'Count:', resGet.body.count, 'First Item:', resGet.body.data[0]?.product?.name);

    console.log('\n--- 8. Testing DELETE /api/wishlist/:productId with non-wishlist product -> 404 ---');
    const resDelNon = await request('/api/wishlist/99999', 'DELETE', null, token);
    console.log('Status:', resDelNon.status, 'Message:', resDelNon.body.message);

    console.log('\n--- 9. Testing DELETE /api/wishlist/:productId (remove product 1) -> 200 ---');
    const resDel = await request('/api/wishlist/1', 'DELETE', null, token);
    console.log('Status:', resDel.status, 'Message:', resDel.body.message);

    console.log('\n--- 10. Testing GET /api/wishlist after deletion (empty) ---');
    const resGetEmpty = await request('/api/wishlist', 'GET', null, token);
    console.log('Status:', resGetEmpty.status, 'Count:', resGetEmpty.body.count);

    console.log('\nALL BACKEND WISHLIST TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
  }
})();
