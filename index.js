require('dotenv').config();

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.MongoStore || connectMongo.default;

const app = express();
const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017').trim();
const DB_NAME = (process.env.MONGODB_DB || 'cesmac_blog').trim();

let db;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(session({
    secret: process.env.SESSION_SECRET || 'cesmac_blog_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        dbName: DB_NAME
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 dia
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
}



app.get('/', async (req, res) => {
    const posts = await db.collection('posts').find().sort({ createdAt: -1 }).toArray();
    res.render('index', { posts });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const email = (req.body.email || '').trim().toLowerCase();
    const senha = req.body.senha || '';

    if (!email || !senha) {
        return res.status(400).render('login', { error: 'Preencha e-mail e senha.' });
    }

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).render('login', { error: 'Credenciais inválidas.' });
        }

        const match = await bcrypt.compare(senha, user.passwordHash);
        if (!match) {
            return res.status(401).render('login', { error: 'Credenciais inválidas.' });
        }

        req.session.user = {
            id: user._id,
            nome: user.nome,
            email: user.email
        };

        return res.redirect('/profile');
    } catch (err) {
        console.error(err);
        return res.status(500).render('login', { error: 'Erro interno ao fazer login.' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/register', (req, res) => {
    const ok = req.query.ok === '1';
    res.render('register_user', { error: null, ok, values: null });
});

app.post('/register', async (req, res) => {
    const nome = (req.body.nome || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const senha = req.body.senha || '';
    const senha2 = req.body.senha2 || '';

    const values = { nome, email };

    if (!nome || !email || !senha) {
        return res.status(400).render('register_user', {
            error: 'Preencha nome, e-mail e senha.',
            ok: false,
            values,
        });
    }
    if (senha !== senha2) {
        return res.status(400).render('register_user', {
            error: 'As senhas não coincidem.',
            ok: false,
            values,
        });
    }
    if (senha.length < 6) {
        return res.status(400).render('register_user', {
            error: 'A senha deve ter pelo menos 6 caracteres.',
            ok: false,
            values,
        });
    }

    try {
        const passwordHash = await bcrypt.hash(senha, 10);
        await db.collection('users').insertOne({
            nome,
            email,
            passwordHash,
            createdAt: new Date(),
        });
        return res.redirect('/register?ok=1');
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).render('register_user', {
                error: 'Este e-mail já está cadastrado.',
                ok: false,
                values,
            });
        }
        console.error(err);
        return res.status(500).render('register_user', {
            error: 'Não foi possível concluir o cadastro. Tente novamente.',
            ok: false,
            values,
        });
    }
});

app.get('/posts', async (req, res) => {
    const posts = await db.collection('posts').find().sort({ createdAt: -1 }).toArray();
    res.render('posts', { posts });
});

app.get('/posts/new', requireAuth, (req, res) => {
    res.render('post_form', { post: null, error: null });
});

app.post('/posts/new', requireAuth, async (req, res) => {
    const title = (req.body.title || '').trim();
    const excerpt = (req.body.excerpt || '').trim();
    const content = (req.body.content || '').trim();

    if (!title || !content) {
        return res.status(400).render('post_form', { post: { title, excerpt, content }, error: 'Título e conteúdo são obrigatórios.' });
    }

    const paragraphs = content.split('\n').filter(p => p.trim() !== '');

    await db.collection('posts').insertOne({
        title,
        excerpt,
        paragraphs,
        content,
        authorId: new ObjectId(req.session.user.id),
        date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }),
        createdAt: new Date()
    });

    res.redirect('/posts');
});

app.get('/post/:id', async (req, res) => {
    try {
        const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
        if (!post) {
            return res.status(404).send('Post não encontrado.');
        }
        res.render('post_detail', { post, id: req.params.id });
    } catch {
        res.status(404).send('Post não encontrado.');
    }
});

app.get('/posts/edit/:id', requireAuth, async (req, res) => {
    try {
        const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id), authorId: new ObjectId(req.session.user.id) });
        if (!post) {
            return res.status(403).send('Não autorizado ou post não encontrado.');
        }
        res.render('post_form', { post, error: null });
    } catch {
        res.status(404).send('Post não encontrado.');
    }
});

app.post('/posts/edit/:id', requireAuth, async (req, res) => {
    const title = (req.body.title || '').trim();
    const excerpt = (req.body.excerpt || '').trim();
    const content = (req.body.content || '').trim();

    if (!title || !content) {
        return res.status(400).render('post_form', { post: { _id: req.params.id, title, excerpt, content }, error: 'Título e conteúdo são obrigatórios.' });
    }

    const paragraphs = content.split('\n').filter(p => p.trim() !== '');

    try {
        await db.collection('posts').updateOne(
            { _id: new ObjectId(req.params.id), authorId: new ObjectId(req.session.user.id) },
            { $set: { title, excerpt, content, paragraphs, updatedAt: new Date() } }
        );
        res.redirect(`/post/${req.params.id}`);
    } catch {
        res.status(500).send('Erro ao editar post.');
    }
});

app.post('/posts/delete/:id', requireAuth, async (req, res) => {
    try {
        await db.collection('posts').deleteOne({ _id: new ObjectId(req.params.id), authorId: new ObjectId(req.session.user.id) });
        res.redirect('/posts');
    } catch {
        res.status(500).send('Erro ao deletar post.');
    }
});

app.get('/profile', requireAuth, (req, res) => {
    res.render('profile');
});


async function main() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    await db.collection('users').createIndex({ email: 1 }, { unique: true }); // Não pode existir 2 usuários com mesmo e-mail

    const postCount = await db.collection('posts').countDocuments();
    if (postCount === 0) {
        console.log('Populando banco com posts de exemplo...');
        const initPosts = [
            {
                title: 'O que é aprendizado de máquina?',
                date: '15 mar 2026',
                excerpt: 'Uma introdução simples a como computadores aprendem a partir de dados.',
                paragraphs: [
                    'Aprendizado de máquina (machine learning) é uma área da inteligência artificial em que programas melhoram o desempenho em uma tarefa com experiência, sem serem explicitamente programados para cada caso.',
                    'Em vez de regras fixas escritas à mão, o sistema identifica padrões em exemplos — por exemplo, classificar e-mails como spam ou reconhecer imagens.',
                    'Este texto é fictício e serve apenas para o exercício de templates EJS e rotas no Express.'
                ],
                content: 'Aprendizado de máquina (machine learning) é uma área da inteligência artificial em que programas melhoram o desempenho em uma tarefa com experiência, sem serem explicitamente programados para cada caso.\n\nEm vez de regras fixas escritas à mão, o sistema identifica padrões em exemplos — por exemplo, classificar e-mails como spam ou reconhecer imagens.\n\nEste texto é fictício e serve apenas para o exercício de templates EJS e rotas no Express.',
                createdAt: new Date()
            },
            {
                title: 'Redes neurais em poucas palavras',
                date: '22 mar 2026',
                excerpt: 'Ideia geral de neurônios artificiais e camadas, sem matemática pesada.',
                paragraphs: [
                    'Redes neurais artificiais são inspiradas no cérebro: unidades simples (neurônios) conectadas em camadas, combinando entradas e produzindo saídas.',
                    'Redes profundas (deep learning) empilham muitas camadas e se destacam em visão, linguagem e outros domínios com grandes volumes de dados.',
                    'Conteúdo ilustrativo para aula — não substitui curso nem documentação técnica.'
                ],
                content: 'Redes neurais artificiais são inspiradas no cérebro: unidades simples (neurônios) conectadas em camadas, combinando entradas e produzindo saídas.\n\nRedes profundas (deep learning) empilham muitas camadas e se destacam em visão, linguagem e outros domínios com grandes volumes de dados.\n\nConteúdo ilustrativo para aula — não substitui curso nem documentação técnica.',
                createdAt: new Date()
            }
        ];
        await db.collection('posts').insertMany(initPosts);
    }

    app.listen(3000, () => {
        console.log('Example app listening on port 3000!');
    });
}

main().catch((err) => {
    console.error('Falha ao iniciar:', err);
    process.exit(1);
});
