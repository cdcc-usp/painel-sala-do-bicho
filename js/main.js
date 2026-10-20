'use strict';

// Estado compartilhado pelos scripts clássicos; tudo é descartado ao recarregar.
const estado = {
    telaAtual: 'dante',
    etapaDanteAtual: 0,
    somAtivo: CONFIG.somInicialmenteAtivo,
    animalAberto: null,
    reinicioAutomaticoPausado: false
};
const elementos = {};
const etapasDante = CONFIG.dante.etapas.filter((etapa) => CONFIG.video.ativo || !etapa.somenteComVideo);

document.addEventListener('DOMContentLoaded', iniciarAplicacao);

function iniciarAplicacao() {
    mapearElementos();
    configurarEventos();
    configurarGaleria();
    configurarMediacao();
    prepararMidias();
    atualizarControleSom();
    atualizarControleReinicio();
    atualizarEtapaDante();
    elementos['versao-app'].textContent = `versão ${CONFIG.versao}`;
    mudarTela('dante');

    console.info(`Painel Interativo — versão ${CONFIG.versao}`);
}

function mapearElementos() {
    document.querySelectorAll('[id]').forEach((elemento) => {
        elementos[elemento.id] = elemento;
    });
}

function configurarEventos() {
    document.addEventListener('click', tratarToqueTutorial);
    elementos['btn-inicio'].addEventListener('click', reiniciarExperiencia);
    elementos['seta-avancar'].addEventListener('click', mostrarOrientacoesDante);
    elementos['seta-voltar-video'].addEventListener('click', () => mudarTela('video'));

    document.addEventListener('pointerdown', registrarAtividade, { passive: true });
    document.addEventListener('keydown', (evento) => {
        registrarAtividade();
        if (conterFocoModal(evento)) return;
        if (conterFocoTutorial(evento)) return;
        if (tratarTeclaTutorial(evento)) return;
        if (!elementos['modal-senha'].hidden && elementos['modal-inatividade'].hidden) {
            tratarTeclaSenha(evento);
        } else if (evento.key === 'Escape') {
            fecharModalAtivo();
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) pausarTodasAsMidias();
        else verificarInatividade();
    });
    window.addEventListener('focus', verificarInatividade);
}

function atualizarEtapaDante() {
    const etapa = etapasDante[estado.etapaDanteAtual];
    elementos['rotulo-etapa'].textContent = etapa.rotulo || '';
    elementos['rotulo-etapa'].hidden = !etapa.rotulo;
    elementos['fala-dante'].textContent = etapa.fala;
    elementos['complemento-dante'].textContent = etapa.complemento;
    elementos['aviso-avancar-dante'].hidden = Boolean(etapa.interativa);
    elementos['tela-dante'].tabIndex = etapa.interativa ? -1 : 0;
    if (etapa.interativa) elementos['tela-dante'].removeAttribute('aria-describedby');
    else elementos['tela-dante'].setAttribute('aria-describedby', 'aviso-avancar-dante');
    elementos['btn-inicio'].classList.toggle('oculto', estado.etapaDanteAtual === 0);
    elementos['seta-voltar-video'].hidden = !CONFIG.video.ativo || !etapa.aposVideo;
    elementos['progresso-tutorial'].textContent = `${estado.etapaDanteAtual + 1} / ${etapasDante.length}`;

    elementos['indicador-etapas'].replaceChildren();
    etapasDante.forEach((_, indice) => {
        const ponto = document.createElement('span');
        const atual = indice === estado.etapaDanteAtual;
        ponto.className = atual ? 'ponto ativo' : 'ponto';
        ponto.setAttribute('aria-label', `Etapa ${indice + 1} de ${etapasDante.length}`);
        if (atual) ponto.setAttribute('aria-current', 'step');
        elementos['indicador-etapas'].appendChild(ponto);
    });

    const balao = elementos['balao-dante'];
    balao.classList.remove('animar-entrada');
    requestAnimationFrame(() => balao.classList.add('animar-entrada'));
    atualizarTutorialDante();
}

function avancarApresentacao() {
    if (estado.telaAtual !== 'dante' || etapasDante[estado.etapaDanteAtual].interativa) return;
    const proximaEtapa = etapasDante[estado.etapaDanteAtual + 1];
    if (CONFIG.video.ativo && proximaEtapa?.aposVideo) {
        mudarTela('video');
    } else if (proximaEtapa) {
        estado.etapaDanteAtual += 1;
        atualizarEtapaDante();
    } else {
        mudarTela('galeria');
    }
}

function mostrarOrientacoesDante() {
    estado.etapaDanteAtual = etapasDante.findIndex((etapa) => etapa.aposVideo);
    atualizarEtapaDante();
    mudarTela('dante');
}

function mudarTela(nome) {
    if (nome === 'video' && !CONFIG.video.ativo) return;
    cancelarInatividade();
    pararVideo();
    pararAudioAnimal();
    estado.telaAtual = nome;

    ['dante', 'video', 'galeria'].forEach((tela) => {
        elementos[`tela-${tela}`].classList.toggle('ativa', tela === nome);
    });
    document.body.classList.toggle('galeria-ativa', nome === 'galeria');
    document.body.classList.toggle('video-ativo', nome === 'video');
    elementos['btn-reinicio'].classList.toggle('oculto', nome !== 'galeria');
    elementos['btn-inicio'].classList.toggle('oculto', nome === 'dante' && estado.etapaDanteAtual === 0);
    window.scrollTo({ top: 0, behavior: 'auto' });
    atualizarTutorialDante();

    if (nome === 'video') iniciarVideo();
    if (nome === 'galeria') agendarInatividade();
}

function fecharModalAtivo() {
    if (!elementos['modal-inatividade'].hidden) continuarSessao();
    else if (!elementos['modal-senha'].hidden) fecharSenhaMediacao();
    else if (!elementos['modal-animal'].hidden) fecharAnimal();
}

function reiniciarExperiencia() {
    estado.reinicioAutomaticoPausado = false;
    estado.animalAberto = null;
    estado.etapaDanteAtual = 0;
    atualizarControleReinicio();
    limparSenhaMediacao();
    ocultarGuiaFecharAnimal();
    fecharTodosOsModais();

    if (CONFIG.restaurarSomAoReiniciar) {
        estado.somAtivo = CONFIG.somInicialmenteAtivo;
        atualizarControleSom();
    }

    atualizarEtapaDante();
    mudarTela('dante');
}
