// Configurações que podem ser alteradas sem mexer na lógica da aplicação.
const CONFIG = Object.freeze({
    versao: '1.0.0',

    // Após 120 segundos sem interação, o aviso de reinício será exibido.
    tempoInatividadeMs: 12000000,
    tempoAvisoMs: 1500000,

    somInicialmenteAtivo: true,
    restaurarSomAoReiniciar: true,

    video: {
        arquivo: 'assets/videos/fauna.mp4'
    },

    dante: {
        imagem: 'assets/dante/dante.png',
        etapas: [
            {
                rotulo: 'BOAS-VINDAS',
                fala: 'Olá! Eu sou o Dante, o lobo-guará, mascote do CDCC.',
                complemento: 'Vou acompanhar você ao longo dessa jornada.',
                botao: 'Prazer, Dante!'
            },
            {
                rotulo: 'UM CONVITE ESPECIAL',
                fala: 'Quero convidar você para conhecer os animais que vivem em nossa região.',
                complemento: 'Você poderá conhecer curiosidades e ouvir os sons de cada um deles.',
                botao: 'Continuar'
            },
            {
                rotulo: 'ANTES DE COMEÇAR…',
                fala: 'Você já conhece alguns desses animais?',
                complemento: 'Toque nas imagens, observe os detalhes e descubra quem vive por aqui!',
                botao: 'Assistir ao Vídeo'
            }
        ]
    }
});
