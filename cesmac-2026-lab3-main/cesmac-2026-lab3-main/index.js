express = require('express');
app = express();

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
    res.render('register_user');
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

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
