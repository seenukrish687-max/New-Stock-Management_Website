const http = require('http');

const testEndpoint = (path) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, data: data });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
};

const runTest = async () => {
    console.log('Testing API Connection to http://localhost:5000...');

    try {
        console.log('\n1. Testing /api/products...');
        const productsRes = await testEndpoint('/api/products');
        console.log(`Status: ${productsRes.statusCode}`);
        if (productsRes.statusCode === 200) {
            const products = JSON.parse(productsRes.data);
            console.log(`Success! Found ${products.length} products.`);
        } else {
            console.log('Failed to fetch products.');
            console.log('Response:', productsRes.data);
        }

        console.log('\n2. Testing /api/transactions...');
        const transRes = await testEndpoint('/api/transactions');
        console.log(`Status: ${transRes.statusCode}`);
        if (transRes.statusCode === 200) {
            const trans = JSON.parse(transRes.data);
            console.log(`Success! Found ${trans.stockIn.length} Stock In and ${trans.stockOut.length} Stock Out transactions.`);
        } else {
            console.log('Failed to fetch transactions.');
        }

    } catch (error) {
        console.error('\nCRITICAL ERROR: Could not connect to server.');
        console.error('Is the server running?');
        console.error('Error details:', error.message);
    }
};

runTest();
