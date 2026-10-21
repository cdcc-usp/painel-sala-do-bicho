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
        // Ative quando o vídeo final estiver pronto; restaura também a etapa intermediária.
        ativo: false,
        arquivo: 'assets/videos/fauna.mp4'
    },

    tutorial: {
        animalId: 'gato-mourisco',
        tempoDestaqueMs: 8000
    },

    dante: {
        imagem: 'assets/dante/dante.png',
        etapas: [
            {
                fala: 'Olá! Eu sou o Dante, mascote do CDCC.',
                complemento: 'Vou acompanhar você ao longo dessa jornada.'
            },
            {
                somenteComVideo: true,
                fala: 'Vamos conhecer os animais que vivem em nossa região?',
                complemento: 'Toque nas imagens, observe os detalhes e descubra quem vive por aqui.'
            },
            {
                aposVideo: true,
                fala: 'Vamos conhecer os animais que vivem em nossa região?',
                complemento: 'Toque nas imagens para ouvir os sons dos animais e descubra quem vive por aqui.'
            },
            {
                interativa: true,
                fala: 'Vamos conhecer um animal?',
                complemento: 'Toque no quadrado iluminado para conhecer o animal e ouvir seu som.'
            },
            {
                aoAbrirAnimal: true,
                interativa: true,
                fala: 'Agora é com você!',
                complemento: 'Toque no X para fechar esta janela. Depois, escolha outros animais para conhecê-los e ouvir seus sons.'
            }
        ]
    }
});
