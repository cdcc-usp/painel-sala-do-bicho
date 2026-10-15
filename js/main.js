'use strict';

let etapaDanteAtual = 0;
let somAtivo = CONFIG.somInicialmenteAtivo;
let audioAtual = null;
let animalAberto = null;
let temporizadorInatividade = null;
let intervaloContagem = null;
let videoAberto = false;
let reinicioAutomaticoPausado = false;

const elementos = {};

document.addEventListener('DOMContentLoaded', iniciarAplicacao);

function iniciarAplicacao() {
    mapearElementos();
    configurarEventos();
    gerarTecladoSenha();
    prepararMidias();
    gerarCards();
    atualizarControleSom();
    atualizarControleReinicio();
    atualizarEtapaDante();
    atualizarVersao();
    mudarTela('dante');

    console.info(`Painel Interativo — versão ${CONFIG.versao}`);
}

function mapearElementos() {
    const ids = [
        'tela-dante', 'tela-video', 'tela-galeria', 'imagem-dante', 'dante-substituto',
        'rotulo-etapa', 'fala-dante', 'complemento-dante', 'btn-avancar',
        'indicador-etapas', 'btn-inicio', 'btn-som', 'icone-som', 'texto-som',
        'grid-animais', 'versao-app',
        'modal-animal', 'btn-fechar-animal', 'modal-img', 'modal-status-som',
        'btn-repetir-som', 'modal-titulo', 'modal-cientifico',
        'modal-tags-container', 'modal-texto', 'modal-fonte',
        'player-video', 'erro-video',
        'modal-inatividade', 'contador-inatividade', 'btn-continuar',
        'seta-avancar', 'seta-voltar', 'btn-reinicio', 'texto-reinicio',
        'modal-senha', 'btn-fechar-senha', 'form-senha', 'senha-mediacao',
        'teclado-senha', 'erro-senha', 'btn-mostrar-senha',
        'btn-limpar-senha', 'btn-apagar-senha', 'btn-confirmar-senha'
    ];

    ids.forEach((id) => {
        elementos[id] = document.getElementById(id);
    });
}

function configurarEventos() {
    elementos['btn-avancar'].addEventListener('click', avancarApresentacao);
    elementos['btn-inicio'].addEventListener('click', reiniciarExperiencia);
    elementos['btn-som'].addEventListener('click', alternarSom);
    elementos['seta-avancar'].addEventListener('click', () => mudarTela('galeria'));
    elementos['seta-voltar'].addEventListener('click', () => mudarTela('video'));
    elementos['btn-fechar-animal'].addEventListener('click', fecharAnimal);
    elementos['btn-repetir-som'].addEventListener('click', repetirSomAnimal);
    elementos['btn-continuar'].addEventListener('click', continuarSessao);
    elementos['btn-reinicio'].addEventListener('click', alternarReinicioAutomatico);
    elementos['btn-fechar-senha'].addEventListener('click', fecharSenhaMediacao);
    elementos['form-senha'].addEventListener('submit', confirmarSenhaMediacao);
    elementos['btn-limpar-senha'].addEventListener('click', () => atualizarSenhaDigitada(''));
    elementos['btn-apagar-senha'].addEventListener('click', apagarCaractereSenha);
    elementos['btn-mostrar-senha'].addEventListener('click', alternarVisibilidadeSenha);
    elementos['teclado-senha'].addEventListener('click', (evento) => {
        const tecla = evento.target.closest('[data-caractere]');
        if (tecla) atualizarSenhaDigitada(elementos['senha-mediacao'].value + tecla.dataset.caractere);
    });
    elementos['modal-senha'].addEventListener('click', (evento) => {
        if (evento.target === elementos['modal-senha']) fecharSenhaMediacao();
    });

    elementos['modal-animal'].addEventListener('click', (evento) => {
        if (evento.target === elementos['modal-animal']) fecharAnimal();
    });

    // Pausar mantém a tela atual; somente o término da reprodução avança automaticamente.
    elementos['player-video'].addEventListener('ended', () => mudarTela('galeria'));
    elementos['player-video'].addEventListener('error', mostrarErroVideo);

    document.addEventListener('pointerdown', registrarAtividade, { passive: true });
    document.addEventListener('keydown', (evento) => {
        registrarAtividade();
        if (!elementos['modal-senha'].hidden && elementos['modal-inatividade'].hidden) {
            tratarTeclaSenha(evento);
            return;
        }
        if (evento.key === 'Escape') fecharModalAtivo();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pausarTodasAsMidias();
        } else {
            agendarInatividade();
        }
    });
}

function prepararMidias() {
    elementos['imagem-dante'].src = CONFIG.dante.imagem;
    elementos['imagem-dante'].addEventListener('load', () => {
        elementos['imagem-dante'].hidden = false;
        elementos['dante-substituto'].hidden = true;
    });
    elementos['imagem-dante'].addEventListener('error', () => {
        elementos['imagem-dante'].hidden = true;
        elementos['dante-substituto'].hidden = false;
    });

    elementos['player-video'].src = CONFIG.video.arquivo;
}

function atualizarEtapaDante() {
    const etapa = CONFIG.dante.etapas[etapaDanteAtual];
    elementos['rotulo-etapa'].textContent = etapa.rotulo;
    elementos['fala-dante'].textContent = etapa.fala;
    elementos['complemento-dante'].textContent = etapa.complemento;
    elementos['btn-avancar'].textContent = etapa.botao;

    elementos['indicador-etapas'].replaceChildren();
    CONFIG.dante.etapas.forEach((_, indice) => {
        const ponto = document.createElement('span');
        ponto.className = indice === etapaDanteAtual ? 'ponto ativo' : 'ponto';
        ponto.setAttribute('aria-label', `Etapa ${indice + 1} de ${CONFIG.dante.etapas.length}`);
        elementos['indicador-etapas'].appendChild(ponto);
    });

    const balao = document.getElementById('balao-dante');
    balao.classList.remove('animar-entrada');
    requestAnimationFrame(() => balao.classList.add('animar-entrada'));
}

function avancarApresentacao() {
    if (etapaDanteAtual < CONFIG.dante.etapas.length - 1) {
        etapaDanteAtual += 1;
        atualizarEtapaDante();
        return;
    }

    mudarTela('video');
}

function mudarTela(idTela) {
    const aliases = {
        dante: 'tela-dante',
        video: 'tela-video',
        galeria: 'tela-galeria'
    };
    const telaAtiva = aliases[idTela] || idTela;
    const telas = ['tela-dante', 'tela-video', 'tela-galeria'];

    document.body.classList.toggle('galeria-ativa', telaAtiva === 'tela-galeria');
    document.body.classList.toggle('video-ativo', telaAtiva === 'tela-video');
    elementos['btn-reinicio'].classList.toggle('oculto', telaAtiva !== 'tela-galeria');
    window.scrollTo({ top: 0, behavior: 'auto' });

    telas.forEach((id) => {
        const tela = document.getElementById(id);
        if (tela) {
            tela.classList.toggle('ativa', id === telaAtiva);
        }
    });

    if (telaAtiva === 'tela-video') {
        videoAberto = true;
        cancelarInatividade();
        pararAudioAnimal();
        elementos['erro-video'].hidden = true;
        elementos['player-video'].pause();
        elementos['player-video'].currentTime = 0;
        elementos['player-video'].muted = !somAtivo;
        elementos['player-video'].play().catch(mostrarErroVideo);
        elementos['btn-inicio'].classList.remove('oculto');
        return;
    }

    if (telaAtiva === 'tela-galeria') {
        videoAberto = false;
        elementos['player-video'].pause();
        elementos['player-video'].currentTime = 0;
        pararAudioAnimal();
        elementos['btn-inicio'].classList.remove('oculto');
        agendarInatividade();
        return;
    }

    videoAberto = false;
    cancelarInatividade();
    elementos['player-video'].pause();
    elementos['player-video'].currentTime = 0;
    pararAudioAnimal();
    elementos['btn-inicio'].classList.add('oculto');
}

function gerarCards() {
    const fragmento = document.createDocumentFragment();

    animais.forEach((animal) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `card ${animal.classeTamanho || ''}`.trim();
        card.id = `card-${animal.id}`;
        card.setAttribute('aria-label', `Conhecer ${animal.nome}`);

        const imagem = document.createElement('img');
        imagem.className = 'imagem-card';
        imagem.src = animal.img;
        imagem.alt = animal.nome;
        imagem.loading = 'lazy';
        imagem.addEventListener('error', () => {
            imagem.src = criarImagemSubstituta(animal.nome);
        }, { once: true });

        const nome = document.createElement('span');
        nome.className = 'nome-animal';
        nome.textContent = animal.nome;

        card.append(imagem, nome);
        card.addEventListener('click', () => abrirAnimal(animal.id));
        fragmento.appendChild(card);
    });

    elementos['grid-animais'].replaceChildren(fragmento);
}

function abrirAnimal(animalId) {
    const animal = animais.find((item) => item.id === animalId);
    if (!animal) return;

    animalAberto = animal;
    elementos['modal-img'].src = animal.imgModal || animal.img;
    elementos['modal-img'].alt = animal.nome;
    elementos['modal-img'].onerror = () => {
        elementos['modal-img'].src = criarImagemSubstituta(animal.nome);
    };
    elementos['modal-titulo'].textContent = animal.nome;
    elementos['modal-cientifico'].textContent = animal.cientifico;

    elementos['modal-tags-container'].replaceChildren();
    (animal.destaques || []).forEach((destaque) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = destaque;
        elementos['modal-tags-container'].appendChild(tag);
    });

    elementos['modal-texto'].replaceChildren();
    animal.descricao.split('\n').filter(Boolean).forEach((paragrafo) => {
        const p = document.createElement('p');
        p.textContent = paragrafo;
        elementos['modal-texto'].appendChild(p);
    });

    if (animal.fonte) {
        elementos['modal-fonte'].textContent = `Fonte consultada: ${animal.fonte}`;
        elementos['modal-fonte'].hidden = false;
    } else {
        elementos['modal-fonte'].hidden = true;
    }

    abrirModal(elementos['modal-animal']);
    tocarSomAnimal(animal.audio);
}

function fecharAnimal() {
    pararAudioAnimal();
    animalAberto = null;
    fecharModal(elementos['modal-animal']);
}

function tocarSomAnimal(caminho) {
    pararAudioAnimal();

    if (!somAtivo) {
        atualizarStatusSom('Som desativado', false);
        return;
    }

    if (!caminho) {
        atualizarStatusSom('Som indisponível', false);
        return;
    }

    audioAtual = new Audio(caminho);
    atualizarStatusSom('Reproduzindo o som do animal…', true);

    audioAtual.addEventListener('ended', () => atualizarStatusSom('Som finalizado', false));
    audioAtual.addEventListener('error', () => atualizarStatusSom('Áudio ainda não adicionado', false));
    audioAtual.play().catch(() => atualizarStatusSom('Toque em “Ouvir novamente”', false));
}

function repetirSomAnimal() {
    if (!somAtivo) {
        somAtivo = true;
        atualizarControleSom();
    }
    if (animalAberto) tocarSomAnimal(animalAberto.audio);
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
    somAtivo = !somAtivo;
    atualizarControleSom();

    if (!somAtivo) {
        pararAudioAnimal();
        elementos['player-video'].muted = true;
        if (animalAberto) atualizarStatusSom('Som desativado', false);
    } else {
        elementos['player-video'].muted = false;
    }
}

function atualizarControleSom() {
    elementos['icone-som'].textContent = somAtivo ? '🔊' : '🔇';
    elementos['texto-som'].textContent = somAtivo ? 'Som ligado' : 'Som desligado';
    elementos['btn-som'].setAttribute('aria-pressed', String(!somAtivo));
    elementos['btn-som'].setAttribute('aria-label', somAtivo ? 'Desativar som' : 'Ativar som');
    elementos['player-video'].muted = !somAtivo;
}

function atualizarControleReinicio() {
    elementos['texto-reinicio'].textContent = reinicioAutomaticoPausado ? 'Reinício pausado · Reativar' : 'Pausar reinício';
    elementos['btn-reinicio'].setAttribute('aria-pressed', String(reinicioAutomaticoPausado));
    elementos['btn-reinicio'].setAttribute('aria-label', reinicioAutomaticoPausado
        ? 'Reinício automático pausado. Reativar reinício automático'
        : 'Pausar reinício automático com senha do mediador');
}

function gerarTecladoSenha() {
    Array.from('1234567890').forEach((caractere) => {
        const tecla = document.createElement('button');
        tecla.type = 'button';
        tecla.className = 'tecla-senha';
        tecla.dataset.caractere = caractere;
        tecla.textContent = caractere;
        elementos['teclado-senha'].appendChild(tecla);
    });
}

function alternarReinicioAutomatico() {
    if (reinicioAutomaticoPausado) {
        reinicioAutomaticoPausado = false;
        atualizarControleReinicio();
        agendarInatividade();
        return;
    }

    atualizarSenhaDigitada('');
    elementos['senha-mediacao'].type = 'password';
    elementos['btn-mostrar-senha'].textContent = 'Mostrar';
    elementos['btn-mostrar-senha'].setAttribute('aria-pressed', 'false');
    abrirModal(elementos['modal-senha']);
    elementos['senha-mediacao'].focus();
}

function atualizarSenhaDigitada(valor) {
    elementos['senha-mediacao'].value = valor.replace(/\D/g, '').slice(0, 4);
    elementos['senha-mediacao'].setAttribute('aria-invalid', 'false');
    elementos['erro-senha'].textContent = '';
    elementos['btn-confirmar-senha'].disabled = elementos['senha-mediacao'].value.length !== 4;
}

function apagarCaractereSenha() {
    atualizarSenhaDigitada(elementos['senha-mediacao'].value.slice(0, -1));
}

function alternarVisibilidadeSenha() {
    const mostrar = elementos['senha-mediacao'].type === 'password';
    elementos['senha-mediacao'].type = mostrar ? 'text' : 'password';
    elementos['btn-mostrar-senha'].textContent = mostrar ? 'Ocultar' : 'Mostrar';
    elementos['btn-mostrar-senha'].setAttribute('aria-pressed', String(mostrar));
}

function fecharSenhaMediacao() {
    fecharModal(elementos['modal-senha']);
    atualizarSenhaDigitada('');
    if (telaGaleriaAtiva()) elementos['btn-reinicio'].focus();
}

function confirmarSenhaMediacao(evento) {
    evento.preventDefault();
    if (elementos['senha-mediacao'].value.length !== 4) return;
    if (elementos['senha-mediacao'].value !== CONFIG.senhaMediacao) {
        atualizarSenhaDigitada('');
        elementos['senha-mediacao'].setAttribute('aria-invalid', 'true');
        elementos['erro-senha'].textContent = 'PIN incorreto. Tente novamente.';
        elementos['senha-mediacao'].focus();
        return;
    }

    reinicioAutomaticoPausado = true;
    cancelarInatividade();
    fecharModal(elementos['modal-inatividade']);
    atualizarControleReinicio();
    fecharSenhaMediacao();
}

function tratarTeclaSenha(evento) {
    if (evento.key === 'Tab') {
        const focaveis = Array.from(elementos['modal-senha'].querySelectorAll('button:not([disabled]), input'));
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
        return;
    }
    if (evento.ctrlKey || evento.altKey || evento.metaKey) return;
    if (evento.key === 'Escape') {
        evento.preventDefault();
        fecharSenhaMediacao();
    } else if (evento.key === 'Enter') {
        confirmarSenhaMediacao(evento);
    } else if (evento.key === 'Backspace' || evento.key === 'Delete') {
        evento.preventDefault();
        apagarCaractereSenha();
    } else if (/^\d$/.test(evento.key)) {
        evento.preventDefault();
        atualizarSenhaDigitada(elementos['senha-mediacao'].value + evento.key);
    } else if (evento.key.length === 1) {
        evento.preventDefault();
    }
}

function mostrarErroVideo() {
    elementos['erro-video'].hidden = false;
}

function abrirModal(modal) {
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('ativo'));
    document.body.classList.add('modal-aberto');
}

function fecharModal(modal) {
    if (!modal || modal.hidden) return;
    modal.classList.remove('ativo');
    window.setTimeout(() => {
        modal.hidden = true;
        if (!document.querySelector('.modal-overlay.ativo')) {
            document.body.classList.remove('modal-aberto');
        }
    }, 220);
}

function fecharModalAtivo() {
    if (!elementos['modal-inatividade'].hidden) {
        continuarSessao();
    } else if (!elementos['modal-senha'].hidden) {
        fecharSenhaMediacao();
    } else if (!elementos['modal-animal'].hidden) {
        fecharAnimal();
    }
}

function registrarAtividade() {
    if (!elementos['modal-inatividade'].hidden) return;
    if (!telaGaleriaAtiva()) return;
    if (!videoAberto) agendarInatividade();
}

function agendarInatividade() {
    cancelarInatividade();
    if (!telaGaleriaAtiva()) return;
    if (videoAberto) return;
    if (reinicioAutomaticoPausado) return;

    const tempoAteAviso = Math.max(0, CONFIG.tempoInatividadeMs - CONFIG.tempoAvisoMs);
    temporizadorInatividade = window.setTimeout(exibirAvisoInatividade, tempoAteAviso);
}

function exibirAvisoInatividade() {
    if (reinicioAutomaticoPausado || !telaGaleriaAtiva() || videoAberto) return;
    cancelarInatividade();
    if (!elementos['modal-senha'].hidden) fecharSenhaMediacao();
    let segundosRestantes = Math.ceil(CONFIG.tempoAvisoMs / 1000);
    elementos['contador-inatividade'].textContent = segundosRestantes;
    abrirModal(elementos['modal-inatividade']);
    elementos['btn-continuar'].focus();

    intervaloContagem = window.setInterval(() => {
        segundosRestantes -= 1;
        elementos['contador-inatividade'].textContent = Math.max(0, segundosRestantes);
        if (segundosRestantes <= 0) reiniciarExperiencia();
    }, 1000);
}

function continuarSessao() {
    fecharModal(elementos['modal-inatividade']);
    agendarInatividade();
}

function cancelarInatividade() {
    window.clearTimeout(temporizadorInatividade);
    window.clearInterval(intervaloContagem);
    temporizadorInatividade = null;
    intervaloContagem = null;
}

function reiniciarExperiencia() {
    cancelarInatividade();
    reinicioAutomaticoPausado = false;
    atualizarControleReinicio();
    atualizarSenhaDigitada('');
    pararAudioAnimal();

    elementos['player-video'].pause();
    elementos['player-video'].currentTime = 0;
    videoAberto = false;
    animalAberto = null;

    [elementos['modal-animal'], elementos['modal-senha'], elementos['modal-inatividade']].forEach((modal) => {
        modal.classList.remove('ativo');
        modal.hidden = true;
    });
    document.body.classList.remove('modal-aberto');

    if (CONFIG.restaurarSomAoReiniciar) {
        somAtivo = CONFIG.somInicialmenteAtivo;
        atualizarControleSom();
    }

    etapaDanteAtual = 0;
    atualizarEtapaDante();
    mudarTela('dante');
    window.scrollTo({ top: 0, behavior: 'auto' });
}

function pausarTodasAsMidias() {
    pararAudioAnimal();
    elementos['player-video'].pause();
}

function atualizarVersao() {
    elementos['versao-app'].textContent = `versão ${CONFIG.versao}`;
}

function criarImagemSubstituta(texto, cor = '#315d52') {
    const textoSeguro = String(texto).replace(/[<>&"']/g, '');
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
            <rect width="100%" height="100%" fill="${cor}"/>
            <circle cx="450" cy="245" r="90" fill="#f0c75e" opacity=".9"/>
            <text x="50%" y="48%" text-anchor="middle" fill="#102f29" font-size="76">🐾</text>
            <text x="50%" y="76%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="42">${textoSeguro}</text>
        </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function telaGaleriaAtiva() {
    return elementos['tela-galeria']?.classList.contains('ativa');
}
