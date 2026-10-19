'use strict';

let audioAtual = null;
let tentativaVideo = 0;
const errosDeImagem = new WeakMap();

function prepararMidias() {
    const dante = elementos['imagem-dante'];
    const atualizarDante = () => {
        const carregou = dante.complete && dante.naturalWidth > 0;
        dante.hidden = !carregou;
        elementos['dante-substituto'].hidden = carregou;
    };
    dante.addEventListener('load', atualizarDante);
    dante.addEventListener('error', atualizarDante);
    dante.src = CONFIG.dante.imagem;
    atualizarDante();

    const video = elementos['player-video'];
    video.addEventListener('ended', () => {
        // Pausar mantém a tela; somente o término da reprodução avança.
        if (estado.telaAtual === 'video') mostrarOrientacoesDante();
    });
    video.addEventListener('error', mostrarErroVideo);
    elementos['tela-video'].hidden = !CONFIG.video.ativo;
    if (CONFIG.video.ativo) video.src = CONFIG.video.arquivo;
    elementos['btn-som'].addEventListener('click', alternarSom);
    elementos['btn-repetir-som'].addEventListener('click', repetirSomAnimal);
}

function iniciarVideo() {
    const tentativa = ++tentativaVideo;
    elementos['erro-video'].hidden = true;
    elementos['player-video'].muted = !estado.somAtivo;
    elementos['player-video'].play().catch((erro) => {
        // Sair da tela cancela play(); essa resposta não é uma falha de mídia.
        if (tentativa === tentativaVideo && erro.name !== 'AbortError') mostrarErroVideo();
    });
}

function pararVideo() {
    tentativaVideo += 1;
    elementos['player-video'].pause();
    elementos['player-video'].currentTime = 0;
}

function mostrarErroVideo() {
    elementos['erro-video'].hidden = false;
}

function tocarSomAnimal(caminho) {
    pararAudioAnimal();
    if (!estado.somAtivo || !caminho) {
        atualizarStatusSom(estado.somAtivo ? 'Som indisponível' : 'Som desativado', false);
        return;
    }

    const audio = new Audio(caminho);
    audioAtual = audio;
    atualizarStatusSom('Reproduzindo o som do animal…', true);
    const mostrarStatus = (texto) => {
        // Eventos de um áudio anterior não podem mudar o animal aberto agora.
        if (audioAtual === audio) atualizarStatusSom(texto, false);
    };
    audio.addEventListener('ended', () => mostrarStatus('Som finalizado'));
    audio.addEventListener('error', () => mostrarStatus('Áudio ainda não adicionado'));
    audio.play().catch(() => mostrarStatus(audio.error
        ? 'Áudio ainda não adicionado'
        : 'Toque em “Ouvir novamente”'));
}

function repetirSomAnimal() {
    if (!estado.somAtivo) {
        estado.somAtivo = true;
        atualizarControleSom();
    }
    if (estado.animalAberto) tocarSomAnimal(estado.animalAberto.audio);
}

function pararAudioAnimal() {
    if (!audioAtual) return;
    audioAtual.pause();
    audioAtual.currentTime = 0;
    audioAtual = null;
}

function atualizarStatusSom(texto, tocando) {
    elementos['modal-status-som'].textContent = tocando ? `🔊 ${texto}` : texto;
    elementos['modal-status-som'].classList.toggle('tocando', tocando);
}

function alternarSom() {
    estado.somAtivo = !estado.somAtivo;
    atualizarControleSom();
    if (!estado.somAtivo) {
        pararAudioAnimal();
        if (estado.animalAberto) atualizarStatusSom('Som desativado', false);
    }
}

function atualizarControleSom() {
    elementos['icone-som'].textContent = estado.somAtivo ? '🔊' : '🔇';
    elementos['texto-som'].textContent = estado.somAtivo ? 'Som ligado' : 'Som desligado';
    elementos['btn-som'].setAttribute('aria-pressed', String(!estado.somAtivo));
    elementos['btn-som'].setAttribute('aria-label', estado.somAtivo ? 'Desativar som' : 'Ativar som');
    elementos['player-video'].muted = !estado.somAtivo;
}

function pausarTodasAsMidias() {
    pararAudioAnimal();
    elementos['player-video'].pause();
    if (estado.animalAberto) atualizarStatusSom('Som interrompido', false);
}

function prepararImagemAnimal(imagem, caminho, nome) {
    // O modal reutiliza a mesma imagem; substitui também o ouvinte do animal anterior.
    imagem.removeEventListener('error', errosDeImagem.get(imagem));
    const mostrarSubstituta = () => { imagem.src = criarImagemSubstituta(nome); };
    errosDeImagem.set(imagem, mostrarSubstituta);
    imagem.addEventListener('error', mostrarSubstituta, { once: true });
    imagem.src = caminho;
}

function criarImagemSubstituta(texto) {
    const textoSeguro = String(texto).replace(/[<>&"']/g, '');
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
            <rect width="100%" height="100%" fill="#315d52"/>
            <circle cx="450" cy="245" r="90" fill="#f0c75e" opacity=".9"/>
            <text x="50%" y="48%" text-anchor="middle" fill="#102f29" font-size="76">🐾</text>
            <text x="50%" y="76%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="42">${textoSeguro}</text>
        </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
