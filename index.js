require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017').trim();
const DB_NAME = (process.env.MONGODB_DB || 'cesmac_blog').trim();

let db;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

const posts = {
    '1': {
        title: 'O que é aprendizado de máquina?',
        date: '15 mar 2026',
        excerpt: 'Uma introdução simples a como computadores aprendem a partir de dados.',
        paragraphs: [
            'Aprendizado de máquina (machine learning) é uma área da inteligência artificial em que programas melhoram o desempenho em uma tarefa com experiência, sem serem explicitamente programados para cada caso.',
            'Em vez de regras fixas escritas à mão, o sistema identifica padrões em exemplos — por exemplo, classificar e-mails como spam ou reconhecer imagens.',
            'Este texto é fictício e serve apenas para o exercício de templates EJS e rotas no Express.'
        ]
    },
    '2': {
        title: 'Redes neurais em poucas palavras',
        date: '22 mar 2026',
        excerpt: 'Ideia geral de neurônios artificiais e camadas, sem matemática pesada.',
        paragraphs: [
            'Redes neurais artificiais são inspiradas no cérebro: unidades simples (neurônios) conectadas em camadas, combinando entradas e produzindo saídas.',
            'Redes profundas (deep learning) empilham muitas camadas e se destacam em visão, linguagem e outros domínios com grandes volumes de dados.',
            'Conteúdo ilustrativo para aula — não substitui curso nem documentação técnica.'
        ]
    },
    '3': {
        title: 'Ética e IA no dia a dia',
        date: '30 mar 2026',
        excerpt: 'Privacidade, viés e transparência quando sistemas automáticos tomam decisões.',
        paragraphs: [
            'Quando uma IA recomenda notícias, aprova crédito ou prioriza candidatos, surgem perguntas sobre justiça, privacidade e responsabilidade.',
            'Viés nos dados pode reproduzir discriminação; por isso equipes falam em auditoria, explicabilidade e governança.',
            'Parágrafo de encerramento apenas para preencher o layout do post no blog de exemplo.'
        ]
    }
};

app.get('/', (req, res) => {
    res.render('index', { posts });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/login', (req, res) => {
    res.render('login');
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

app.get('/posts', (req, res) => {
    res.render('posts', { posts });
});

app.get('/post/:id', (req, res) => {
    const post = posts[req.params.id];
    if (!post) {
        return res.status(404).send('Post não encontrado.');
    }
    res.render('post_detail', { post, id: req.params.id });
});

app.get('/profile', (req, res) => {
    res.render('profile');
});

async function main() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    app.listen(3000, () => {
        console.log('Example app listening on port 3000!');
    });
}

main().catch((err) => {
    console.error('Falha ao iniciar:', err);
    process.exit(1);
});
