// Configurações que podem ser alteradas sem mexer na lógica da aplicação.
const CONFIG = Object.freeze({
    versao: '1.0.0',

    // Reinicia após 2 minutos sem interação, com aviso nos últimos 15 segundos.
    tempoInatividadeMs: 120000,
    tempoAvisoMs: 15000,
    senhaMediacao: '1980',

    somInicialmenteAtivo: true,
    restaurarSomAoReiniciar: true,

    video: {
        arquivo: 'assets/videos/fauna.mp4'
    },

    dante: {
        imagem: 'assets/dante/dante.png',
        etapas: [
            {
                fala: 'Olá! Eu sou o Dante, mascote do CDCC.',
                complemento: 'Vou acompanhar você ao longo dessa jornada.',
                botao: 'Prazer, Dante!'
            },
            {
                fala: 'Vamos conhecer os animais que vivem em nossa região?',
                complemento: 'Toque nas imagens, observe os detalhes e descubra quem vive por aqui.',
                botao: 'Assistir ao Vídeo'
            },
            {
                aposVideo: true,
                fala: 'Vamos conhecer os animais que vivem em nossa região?',
                complemento: 'Na próxima tela, toque nas imagens para ouvir os sons dos animais e descubra quem vive por aqui.',
                botao: 'Conhecer os animais'
            }
        ]
    }
});
