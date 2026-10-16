'use strict';

const modaisAbertos = [];
const fechamentosModais = new Map();
const focosAnteriores = new WeakMap();
const duracaoFechamentoModalMs = 220; // Mesmo tempo da transição em style.css.

function abrirModal(modal, focoInicial, focoRetorno = document.activeElement) {
    window.clearTimeout(fechamentosModais.get(modal));
    fechamentosModais.delete(modal);
    if (!modaisAbertos.includes(modal)) {
        focosAnteriores.set(modal, focoRetorno);
        modaisAbertos.push(modal);
    }
    modal.hidden = false;
    atualizarFundoModal();
    requestAnimationFrame(() => {
        if (modaisAbertos.includes(modal)) modal.classList.add('ativo');
    });
    (focoInicial || modal.querySelector('button, input')).focus();
}

function fecharModal(modal) {
    if (modal.hidden || fechamentosModais.has(modal)) return;
    const indice = modaisAbertos.indexOf(modal);
    const estavaNoTopo = indice === modaisAbertos.length - 1;
    if (indice >= 0) modaisAbertos.splice(indice, 1);
    modal.classList.remove('ativo');
    atualizarFundoModal();
    if (estavaNoTopo) focosAnteriores.get(modal)?.focus();

    fechamentosModais.set(modal, window.setTimeout(() => {
        modal.hidden = true;
        fechamentosModais.delete(modal);
        atualizarFundoModal();
    }, duracaoFechamentoModalMs));
}

function atualizarFundoModal() {
    const atual = modaisAbertos.at(-1);
    elementos.app.inert = Boolean(atual);
    document.querySelectorAll('.modal-overlay').forEach((modal) => {
        modal.inert = modal !== atual;
    });
    document.body.classList.toggle('modal-aberto', Boolean(document.querySelector('.modal-overlay:not([hidden])')));
}

function fecharTodosOsModais() {
    fechamentosModais.forEach((temporizador) => window.clearTimeout(temporizador));
    fechamentosModais.clear();
    modaisAbertos.length = 0;
    document.querySelectorAll('.modal-overlay').forEach((modal) => {
        modal.hidden = true;
        modal.classList.remove('ativo');
    });
    atualizarFundoModal();
}

function conterFocoModal(evento) {
    const modal = modaisAbertos.at(-1);
    if (evento.key !== 'Tab' || !modal) return false;
    const focaveis = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled])')];
    const primeiro = focaveis[0];
    const ultimo = focaveis.at(-1);
    if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
    }
    return true;
}
