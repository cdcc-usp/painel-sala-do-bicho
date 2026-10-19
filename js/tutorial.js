'use strict';

let temporizadorDestaque = null;
let cardTutorial = null;

function atualizarTutorialDante() {
    limparDestaqueTutorial();
    const ativo = estado.telaAtual === 'dante';
    const etapa = etapasDante[estado.etapaDanteAtual];
    const interativo = ativo && etapa.interativa;
    const galeria = elementos['tela-galeria'];

    document.body.classList.toggle('tutorial-ativo', ativo);
    galeria.classList.toggle('fundo-tutorial', ativo);
    galeria.inert = ativo && !interativo;
    elementos['seta-voltar'].hidden = ativo;
    elementos['tela-dante'].classList.toggle('tutorial-interativo', Boolean(interativo));

    if (interativo) {
        cardTutorial = document.getElementById(`card-${CONFIG.tutorial.animalId}`)
            || elementos['grid-animais'].firstElementChild;
        elementos['grid-animais'].querySelectorAll('.card').forEach((card) => {
            card.inert = card !== cardTutorial;
        });
        if (cardTutorial) {
            cardTutorial.classList.add('alvo-tutorial');
            cardTutorial.setAttribute('aria-describedby', 'complemento-dante');
            cardTutorial.focus({ preventScroll: true });
            temporizadorDestaque = window.setTimeout(() => {
                cardTutorial?.classList.add('aguardando-toque');
            }, CONFIG.tutorial.tempoDestaqueMs);
        }
    } else if (ativo) {
        elementos['btn-avancar'].focus({ preventScroll: true });
    }
}

function limparDestaqueTutorial() {
    window.clearTimeout(temporizadorDestaque);
    temporizadorDestaque = null;
    if (cardTutorial) {
        cardTutorial.classList.remove('alvo-tutorial', 'aguardando-toque');
        cardTutorial.removeAttribute('aria-describedby');
        cardTutorial = null;
    }
    elementos['grid-animais'].querySelectorAll('.card').forEach((card) => { card.inert = false; });
}

function mostrarGuiaFecharAnimal() {
    const indice = etapasDante.findIndex((etapa) => etapa.aoAbrirAnimal);
    if (indice < 0) return;
    const etapa = etapasDante[indice];
    elementos['fala-guia-animal'].textContent = etapa.fala;
    elementos['complemento-guia-animal'].textContent = etapa.complemento;
    elementos['progresso-guia-animal'].textContent = `${indice + 1} / ${etapasDante.length}`;
    elementos['guia-fechar-animal'].hidden = false;
    elementos['btn-fechar-animal'].classList.add('alvo-fechar-tutorial');
    elementos['btn-fechar-animal'].setAttribute('aria-describedby', 'complemento-guia-animal');
}

function ocultarGuiaFecharAnimal() {
    elementos['guia-fechar-animal'].hidden = true;
    elementos['btn-fechar-animal'].classList.remove('alvo-fechar-tutorial');
    elementos['btn-fechar-animal'].removeAttribute('aria-describedby');
}

function conterFocoTutorial(evento) {
    if (evento.key !== 'Tab' || estado.telaAtual !== 'dante') return false;
    const controles = [
        elementos['btn-inicio'], elementos['btn-som'], elementos['seta-voltar-video'],
        elementos['btn-avancar'], cardTutorial
    ].filter((elemento) => elemento && elemento.getClientRects().length);
    const primeiro = controles[0];
    const ultimo = controles.at(-1);
    if (!controles.includes(document.activeElement)) {
        evento.preventDefault();
        primeiro.focus();
    } else if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
    }
    return true;
}
