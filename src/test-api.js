import { spawn } from 'child_process';
import http from 'http';

const PORT = process.env.PORT || 5088;
const BASE_URL = `http://localhost:${PORT}`;

// Helper function to make HTTP requests
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('Starting REST API endpoint integration tests...');

  // Start the server process
  const server = spawn('node', ['src/index.js'], {
    env: { ...process.env, PORT },
    stdio: 'pipe'
  });

  // Handle server output
  server.stdout.on('data', (data) => {
    // console.log(`[Server]: ${data.toString().trim()}`);
  });

  server.stderr.on('data', (data) => {
    console.error(`[Server Error]: ${data.toString().trim()}`);
  });

  // Wait 2 seconds for server to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  let exitCode = 0;
  try {
    // Test 1: Health check
    console.log('\nTest 1: Health Check...');
    const health = await request('GET', '/api/health');
    if (health.status === 200 && health.body.status === 'success') {
      console.log('✔ Health check success!');
    } else {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }

    // Test 2: Login with default user
    console.log('\nTest 2: Authentication Login...');
    const login = await request('POST', '/api/auth/login', {
      identifier: '197411152009121001',
      password: 'polri123'
    });

    if (login.status === 200 && login.body.token) {
      console.log('✔ Login success! Token received.');
    } else {
      throw new Error(`Login failed: ${JSON.stringify(login)}`);
    }

    const token = login.body.token;

    // Test 3: Fetch users list
    console.log('\nTest 3: Get Users List (Authenticated)...');
    const usersList = await request('GET', '/api/users', null, token);
    if (usersList.status === 200 && usersList.body.status === 'success') {
      console.log(`✔ Get users success! Found ${usersList.body.results} users.`);
    } else {
      throw new Error(`Get users failed: ${JSON.stringify(usersList)}`);
    }

    // Test 4: Get content list (Public)
    console.log('\nTest 4: Get Content (Public - no token)...');
    const contentList = await request('GET', '/api/beranda-content');
    if (contentList.status === 200 && contentList.body.status === 'success') {
      console.log(`✔ Public read content success! Found ${contentList.body.data.records.length} records.`);
    } else {
      throw new Error(`Public read content failed: ${JSON.stringify(contentList)}`);
    }

    // Test 5: Create content (Authenticated)
    console.log('\nTest 5: Create Content (Protected)...');
    const create = await request('POST', '/api/beranda-content', {
      title: 'Uji Coba Judul Dinamis',
      category: 'Headline',
      date: '2026-07-09',
      status: 'Published'
    }, token);

    let createdId;
    if (create.status === 201 && create.body.status === 'success') {
      createdId = create.body.data.record.id;
      console.log(`✔ Create content success! Auto-generated ID: ${createdId}`);
    } else {
      throw new Error(`Create content failed: ${JSON.stringify(create)}`);
    }

    // Test 6: Update content (Authenticated)
    console.log('\nTest 6: Update Content (Protected)...');
    const update = await request('PUT', `/api/beranda-content/${createdId}`, {
      title: 'Uji Coba Judul Dinamis (Updated)',
      category: 'Headline Updated'
    }, token);

    if (update.status === 200 && update.body.status === 'success' && update.body.data.record.title.includes('Updated')) {
      console.log('✔ Update content success!');
    } else {
      throw new Error(`Update content failed: ${JSON.stringify(update)}`);
    }

    // Test 7: Delete content (Authenticated)
    console.log('\nTest 7: Delete Content (Protected)...');
    const del = await request('DELETE', `/api/beranda-content/${createdId}`, null, token);
    if (del.status === 200 && del.body.status === 'success') {
      console.log('✔ Delete content success!');
    } else {
      throw new Error(`Delete content failed: ${JSON.stringify(del)}`);
    }

    console.log('\n=======================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('=======================================');
  } catch (error) {
    console.error('\n❌ Integration Test Failed:', error.message);
    exitCode = 1;
  } finally {
    // Kill the server
    server.kill();
    process.exit(exitCode);
  }
}

runTests();
