const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir o parsing de JSON
app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://atlas-sql-66466107e817fe271a3705c0-tndms.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Definir schema do usuário
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Criar modelo de usuário
const User = mongoose.model('User', UserSchema);

// Rota para cadastro de usuários
app.post('/api/register', async (req, res) => {
    try {
        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Criar novo usuário
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword
        });

        // Salvar usuário no banco de dados
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Rota para obter todos os usuários
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para obter um usuário por ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para atualizar um usuário por ID
app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.username = req.body.username || user.username;
            user.password = req.body.password || user.password;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para excluir um usuário por ID
app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.remove();
            res.json({ message: 'User deleted' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// server.js

// Rota para inserir usuários fictícios no banco de dados
app.post('/api/addFakeUsers', async (req, res) => {
    try {
        // Usuários fictícios
        const fakeUsers = [
            { username: 'Daniele', password: '200784' },
            { username: 'Bruna', password: '220685' },
            { username: 'Eduarda', password: '120512' },
            { username: 'Fátima', password: '130354' },
            { username: 'Orlando', password: '170254' }
        ];

        // Inserir usuários fictícios no banco de dados
        const insertedUsers = await User.insertMany(fakeUsers);

        res.status(201).json(insertedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add fake users', error: error.message });
    }
});
