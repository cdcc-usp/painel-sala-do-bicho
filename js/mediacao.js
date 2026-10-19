'use strict';

let temporizadorAviso = null;
let temporizadorReinicio = null;
let intervaloContagem = null;
let prazoReinicio = 0;

function configurarMediacao() {
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

    Array.from('1234567890').forEach((caractere) => {
        const tecla = document.createElement('button');
        tecla.type = 'button';
        tecla.className = 'tecla-senha';
        tecla.dataset.caractere = caractere;
        tecla.textContent = caractere;
        elementos['teclado-senha'].appendChild(tecla);
    });
}

function atualizarControleReinicio() {
    const pausado = estado.reinicioAutomaticoPausado;
    elementos['texto-reinicio'].textContent = pausado ? 'Reinício pausado · Reativar' : 'Pausar reinício';
    elementos['btn-reinicio'].setAttribute('aria-pressed', String(pausado));
    elementos['btn-reinicio'].setAttribute('aria-label', pausado
        ? 'Reinício automático pausado. Reativar reinício automático'
        : 'Pausar reinício automático com senha do mediador');
}

function alternarReinicioAutomatico() {
    if (estado.reinicioAutomaticoPausado) {
        estado.reinicioAutomaticoPausado = false;
        atualizarControleReinicio();
        agendarInatividade();
        return;
    }
    limparSenhaMediacao();
    abrirModal(elementos['modal-senha'], elementos['senha-mediacao'], elementos['btn-reinicio']);
}

function limparSenhaMediacao() {
    atualizarSenhaDigitada('');
    elementos['senha-mediacao'].type = 'password';
    elementos['btn-mostrar-senha'].textContent = 'Mostrar';
    elementos['btn-mostrar-senha'].setAttribute('aria-pressed', 'false');
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
    limparSenhaMediacao();
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
    estado.reinicioAutomaticoPausado = true;
    cancelarInatividade();
    atualizarControleReinicio();
    fecharSenhaMediacao();
}

function tratarTeclaSenha(evento) {
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

function registrarAtividade() {
    if (verificarInatividade() || !elementos['modal-inatividade'].hidden) return;
    agendarInatividade();
}

function verificarInatividade() {
    if (estado.telaAtual !== 'galeria' || estado.reinicioAutomaticoPausado || !prazoReinicio) return false;

    // O navegador pode suspender callbacks em segundo plano; o prazo continua valendo.
    const restante = prazoReinicio - Date.now();
    if (restante <= 0) {
        reiniciarExperiencia();
        return true;
    }
    if (restante <= CONFIG.tempoAvisoMs) exibirAvisoInatividade();
    return false;
}

function agendarInatividade() {
    cancelarInatividade();
    if (estado.telaAtual !== 'galeria' || estado.reinicioAutomaticoPausado) return;

    prazoReinicio = Date.now() + CONFIG.tempoInatividadeMs;
    const tempoAteAviso = Math.max(0, CONFIG.tempoInatividadeMs - CONFIG.tempoAvisoMs);
    temporizadorAviso = window.setTimeout(exibirAvisoInatividade, tempoAteAviso);
    temporizadorReinicio = window.setTimeout(reiniciarExperiencia, CONFIG.tempoInatividadeMs);
}

function exibirAvisoInatividade() {
    if (estado.telaAtual !== 'galeria' || estado.reinicioAutomaticoPausado
        || !elementos['modal-inatividade'].hidden) return;
    if (!elementos['modal-senha'].hidden) fecharSenhaMediacao();
    atualizarContagemInatividade();
    abrirModal(elementos['modal-inatividade'], elementos['btn-continuar']);
    intervaloContagem = window.setInterval(atualizarContagemInatividade, 1000);
}

function atualizarContagemInatividade() {
    // A contagem é visual; o reinício usa seu próprio prazo, sem acumular atrasos.
    const segundos = Math.ceil((prazoReinicio - Date.now()) / 1000);
    elementos['contador-inatividade'].textContent = Math.max(0, segundos);
}

function continuarSessao() {
    fecharModal(elementos['modal-inatividade']);
    agendarInatividade();
}

function cancelarInatividade() {
    window.clearTimeout(temporizadorAviso);
    window.clearTimeout(temporizadorReinicio);
    window.clearInterval(intervaloContagem);
    temporizadorAviso = null;
    temporizadorReinicio = null;
    intervaloContagem = null;
    prazoReinicio = 0;
}
