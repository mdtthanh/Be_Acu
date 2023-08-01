const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const jsonServer = require('json-server')
const jsonServerMiddlewares = jsonServer.defaults()
const server = jsonServer.create()
const router = jsonServer.router('db.json')

server.use(bodyParser.json({ extended: true }));

const secretKey = "thisIsSecretKey";

const port = 3000;
const users = [
    { id: 1, username: 'admin', password: 'admin' },
    { id: 2, username: 'test', password: 'test' },
];

// Login endpoint
server.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user in the array simulator db
    const user = users.find((user) => user.username === username && user.password === password);

    if (!user) {
        // If the user is not found, return a 401 Unauthorized status
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If the user is found, generate a JWT token and return it
    const token = jwt.sign({ userId: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
    return res.status(200).json({ message: 'Login successful', token });
});


// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Missing token' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
};


server.put('/Generator/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;

    // Find the product in the 'db.json' file
    const product = db.products.find((product) => product.id === productId);

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Update the product with new data
    Object.assign(product, updatedProduct);

    // Save the updated product back to the 'db.json' file
    fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

    return res.status(200).json({ message: 'Product updated successfully', product });
});


server.use(authenticateToken);
server.use(jsonServerMiddlewares);
server.use(router);

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});