// Executado dentro do navegador por executar.py. Exercita a interface da aplicação.
const concluir = window.concluirTestes;
const testes = [];
const erros = [];
const setTimeoutOriginal = window.setTimeout.bind(window);
const clearTimeoutOriginal = window.clearTimeout.bind(window);
const esperarQuadro = () => new Promise((resolver, rejeitar) => {
    const limite = setTimeoutOriginal(() => rejeitar(new Error('O navegador não renderizou um quadro.')), 5000);
    requestAnimationFrame(() => {
        clearTimeoutOriginal(limite);
        resolver();
    });
});
window.addEventListener('error', (evento) => {
    if (evento.message) erros.push(evento.message);
});
window.addEventListener('unhandledrejection', (evento) => erros.push(String(evento.reason)));

function conferir(condicao, mensagem) {
    if (!condicao) throw new Error(mensagem);
}

async function testar(nome, verificar) {
    try {
        await verificar();
        testes.push({ nome, ok: true });
    } catch (erro) {
        testes.push({ nome, ok: false, erro: erro.message });
    }
}

const el = (id) => document.getElementById(id);
const clicar = (id) => el(id).click();
const tocarTela = () => clicar('tela-dante');
const tecla = (key, opcoes = {}) => document.dispatchEvent(new KeyboardEvent('keydown', {
    key, bubbles: true, cancelable: true, ...opcoes
}));
const tela = (nome) => el(`tela-${nome}`).classList.contains('ativa');
const comVideo = CONFIG.video.ativo;

function carregarMidia(caminho, tipo) {
    return new Promise((resolver, rejeitar) => {
        const recurso = document.createElement(tipo);
        const falhar = (mensagem) => {
            clearTimeoutOriginal(limite);
            rejeitar(new Error(`${caminho}: ${mensagem}`));
        };
        const limite = setTimeoutOriginal(() => falhar('tempo de carregamento excedido'), 10000);
        recurso.addEventListener(tipo === 'img' ? 'load' : 'loadedmetadata', () => {
            clearTimeoutOriginal(limite);
            resolver();
        }, { once: true });
        recurso.addEventListener('error', () => falhar('erro de carregamento ou formato'), { once: true });
        recurso.preload = 'metadata';
        recurso.src = caminho;
    });
}

function abrirGaleria() {
    // Percorre o fluxo real conforme a configuração de lançamento.
    reiniciarExperiencia();
    tocarTela();
    tocarTela();
    if (comVideo) {
        clicar('seta-avancar');
        tocarTela();
    }
    concluirTutorial();
}

function concluirTutorial() {
    clicar(`card-${CONFIG.tutorial.animalId}`);
    clicar('btn-fechar-animal');
    avancarTempo(220);
    document.dispatchEvent(new Event('pointerdown'));
}

function abrirPassoInterativo() {
    reiniciarExperiencia();
    mostrarOrientacoesDante();
    tocarTela();
}

// Relógio controlado: os prazos de 105/120 segundos são exercitados sem espera real.
let agora = Date.now();
let proximoId = 1;
const tarefas = new Map();
Date.now = () => agora;
window.setTimeout = (funcao, atraso = 0) => agendar(funcao, atraso, false);
window.setInterval = (funcao, atraso) => agendar(funcao, atraso, true);
window.clearTimeout = window.clearInterval = (id) => tarefas.delete(id);

function agendar(funcao, atraso, repetir) {
    const id = proximoId++;
    tarefas.set(id, { funcao, prazo: agora + atraso, atraso, repetir });
    return id;
}

function avancarTempo(ms) {
    const destino = agora + ms;
    while (true) {
        const proxima = [...tarefas].filter(([, tarefa]) => tarefa.prazo <= destino)
            .sort((a, b) => a[1].prazo - b[1].prazo)[0];
        if (!proxima) break;
        const [id, tarefa] = proxima;
        agora = tarefa.prazo;
        if (tarefa.repetir) tarefa.prazo += tarefa.atraso;
        else tarefas.delete(id);
        tarefa.funcao();
    }
    agora = destino;
}

// Simula reprodução para tornar a regressão independente de codecs e autoplay.
const reproducoes = [];
const pausas = [];
let proximaReproducao = null;
HTMLMediaElement.prototype.play = function () {
    reproducoes.push(this);
    const reproduzir = proximaReproducao;
    proximaReproducao = null;
    return reproduzir ? reproduzir() : Promise.resolve();
};
HTMLMediaElement.prototype.pause = function () { pausas.push(this); };

async function executarTestes() {
    await testar('Mídias ativas carregam imagens ou metadados reais no navegador', async () => {
        const imagens = new Set([CONFIG.dante.imagem, ...animais.flatMap((animal) => [animal.img, animal.imgModal].filter(Boolean))]);
        await Promise.all([
            ...[...imagens].map((caminho) => carregarMidia(caminho, 'img')),
            ...animais.map((animal) => carregarMidia(animal.audio, 'audio')),
            ...(comVideo ? [carregarMidia(CONFIG.video.arquivo, 'video')] : [])
        ]);
    });
    await testar('Catálogo: 18 cards na ordem original e IDs únicos', () => {
        const ids = [...document.querySelectorAll('.card')].map((card) => card.id);
        conferir(ids.join(',') === 'card-gato-mourisco,card-gafanhoto,card-cascavel,card-tamandua,card-lobo-guara,card-saua,card-sapo-cururu,card-jaguatirica,card-seriema,card-tatu-galinha,card-raposa-do-campo,card-anta,card-coruja,card-bugio,card-onca-pintada,card-pica-pau,card-jacare,card-onca-parda', 'Ordem ou quantidade alterada.');
        conferir(new Set(ids).size === ids.length, 'Há IDs repetidos.');
    });
    if (comVideo) await testar('Apresentação → vídeo; pausa mantém a tela; ended abre as orientações', () => {
        conferir(tela('dante'), 'A aplicação não inicia no Dante.');
        tocarTela();
        tocarTela();
        conferir(tela('video'), 'O convite não abre o vídeo.');
        el('player-video').dispatchEvent(new Event('pause'));
        conferir(tela('video'), 'Pausar avançou a tela.');
        el('player-video').dispatchEvent(new Event('ended'));
        conferir(tela('dante') && !el('seta-voltar-video').hidden, 'Fim do vídeo não abre as orientações.');
    });
    if (!comVideo) await testar('Boas-vindas → convite → tutorial, preservando as falas atuais', () => {
        conferir(tela('dante') && el('fala-dante').textContent === CONFIG.dante.etapas[0].fala, 'Não iniciou nas boas-vindas.');
        conferir(el('indicador-etapas').children.length === 4, 'O progresso não contém as quatro falas ativas.');
        conferir(el('tela-galeria').classList.contains('fundo-tutorial') && el('tela-galeria').inert, 'A galeria não está visível e bloqueada sob o tutorial.');
        clicar('card-gato-mourisco');
        conferir(el('modal-animal').hidden, 'Um card abriu antes da etapa interativa.');
        conferir(el('btn-inicio').classList.contains('oculto'), 'Início deve ficar oculto na primeira fala.');
        tocarTela();
        conferir(tela('dante') && etapasDante[estado.etapaDanteAtual].aposVideo, 'O primeiro toque não abriu o convite.');
        conferir(!el('btn-avancar') && !el('aviso-avancar-dante').hidden, 'O botão de conversa não foi substituído pela indicação de toque.');
        conferir(el('seta-voltar-video').hidden, 'Há uma seta para o vídeo desativado.');
        conferir(!el('btn-inicio').classList.contains('oculto'), 'Início não apareceu no convite.');
        clicar('btn-inicio');
        conferir(el('fala-dante').textContent === CONFIG.dante.etapas[0].fala, 'Início não voltou do convite às boas-vindas.');
        tocarTela();
        tocarTela();
        conferir(tela('dante') && el('fala-dante').textContent === CONFIG.dante.etapas.find((etapa) => etapa.interativa).fala, 'O convite não abriu a etapa interativa.');
        conferir(el('aviso-avancar-dante').hidden, 'A etapa obrigatória ainda oferece avanço livre.');
        tocarTela();
        conferir(tela('dante'), 'Foi possível pular o toque no animal.');
        concluirTutorial();
        conferir(tela('galeria'), 'O toque guiado não liberou a galeria.');
        conferir(!reproducoes.includes(el('player-video')), 'O vídeo foi reproduzido no novo fluxo.');
    });
    await testar('Toques na fala, no aviso e no fundo avançam; controles e card obrigatório são preservados', () => {
        reiniciarExperiencia();
        clicar('btn-som');
        conferir(estado.etapaDanteAtual === 0 && !estado.somAtivo, 'Mutar avançou a conversa.');
        clicar('fala-dante');
        conferir(estado.etapaDanteAtual === 1, 'Tocar na fala não avançou uma única etapa.');
        clicar('btn-som');
        conferir(estado.etapaDanteAtual === 1 && estado.somAtivo, 'Desmutar avançou a conversa.');
        clicar('btn-inicio');
        conferir(estado.etapaDanteAtual === 0, 'Início avançou após reiniciar.');
        clicar('imagem-dante');
        conferir(estado.etapaDanteAtual === 1, 'Tocar no Dante não avançou.');
        clicar('aviso-avancar-dante');
        if (comVideo) {
            conferir(tela('video'), 'O toque não abriu o vídeo.');
            clicar('seta-avancar');
            conferir(etapasDante[estado.etapaDanteAtual].aposVideo, 'A seta do vídeo avançou duas etapas.');
            tocarTela();
        }
        const etapaObrigatoria = estado.etapaDanteAtual;
        for (const id of ['tela-dante', 'fala-dante', 'imagem-dante', 'balao-dante', 'card-anta']) clicar(id);
        conferir(tela('dante') && estado.etapaDanteAtual === etapaObrigatoria && el('modal-animal').hidden,
            'Tocar fora do gato-mourisco pulou a etapa obrigatória.');
        concluirTutorial();
    });
    await testar('Enter e Espaço avançam as falas sem repetir nem pular o toque obrigatório', () => {
        reiniciarExperiencia();
        const enviar = (key, repeat = false) => el('tela-dante').dispatchEvent(new KeyboardEvent('keydown', {
            key, repeat, bubbles: true, cancelable: true
        }));
        enviar('Enter');
        conferir(estado.etapaDanteAtual === 1, 'Enter não avançou.');
        enviar('Enter', true);
        conferir(estado.etapaDanteAtual === 1, 'Segurar Enter pulou uma etapa.');
        enviar(' ');
        if (comVideo) {
            conferir(tela('video'), 'Espaço não abriu o vídeo.');
            clicar('seta-avancar');
            enviar('Enter');
        }
        const etapaObrigatoria = estado.etapaDanteAtual;
        enviar('Enter'); enviar(' ');
        conferir(tela('dante') && estado.etapaDanteAtual === etapaObrigatoria && el('modal-animal').hidden,
            'O teclado pulou o card obrigatório.');
        reiniciarExperiencia();
    });
    await testar('Spotlight permite somente o card iluminado e mantém fala e controles dentro da janela', async () => {
        abrirPassoInterativo();
        await esperarQuadro();
        await esperarQuadro();
        const alvo = el(`card-${CONFIG.tutorial.animalId}`);
        conferir(alvo.classList.contains('alvo-tutorial') && !alvo.inert && !el('tela-galeria').inert, 'O card não foi liberado.');
        conferir([...el('grid-animais').children].every((card) => card === alvo || card.inert), 'Outro card está interativo.');
        const r = alvo.getBoundingClientRect();
        const atingido = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        conferir(alvo.contains(atingido), 'A fala ou a camada escura está bloqueando o toque no card.');
        for (const id of ['balao-dante', 'indicador-etapas']) {
            const caixa = el(id).getBoundingClientRect();
            conferir(caixa.left >= 0 && caixa.right <= innerWidth && caixa.top >= 0 && caixa.bottom <= innerHeight, `${id} saiu da janela.`);
        }
        clicar('card-anta');
        conferir(el('modal-animal').hidden, 'Um card sem destaque abriu durante o tutorial.');
        conferir(document.activeElement === alvo, 'O card iluminado não recebeu foco.');
        tecla('Tab');
        conferir(document.activeElement === el('btn-inicio'), 'Tab escapou do tutorial.');
        tecla('Tab', { shiftKey: true });
        conferir(document.activeElement === alvo, 'Shift+Tab não voltou ao card iluminado.');
    });
    await testar('Início, som e avanço recebem toque durante as falas do Dante', async () => {
        reiniciarExperiencia();
        for (const etapa of ['boas-vindas', 'convite', 'toque guiado']) {
            await esperarQuadro();
            for (const id of ['btn-inicio', 'btn-som', 'aviso-avancar-dante', 'seta-voltar-video']) {
                const controle = el(id);
                const caixa = controle.getBoundingClientRect();
                if (!caixa.width || !caixa.height) continue;
                conferir(caixa.left >= 0 && caixa.top >= 0 && caixa.right <= innerWidth && caixa.bottom <= innerHeight, `${id} saiu da janela em ${etapa}.`);
                const atingido = document.elementFromPoint(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
                conferir(controle.contains(atingido), `${id} está coberto por outra camada em ${etapa}.`);
                conferir(!controle.closest('[inert]'), `${id} está bloqueado em ${etapa}.`);
            }
            if (etapa === 'boas-vindas') mostrarOrientacoesDante();
            else if (etapa === 'convite') tocarTela();
        }
        reiniciarExperiencia();
    });
    await testar('Espera de 8s pulsa o destaque; Início cancela o lembrete e restaura a ajuda', () => {
        abrirPassoInterativo();
        const alvo = el(`card-${CONFIG.tutorial.animalId}`);
        avancarTempo(CONFIG.tutorial.tempoDestaqueMs - 1);
        conferir(!alvo.classList.contains('aguardando-toque'), 'O destaque começou a piscar antes do prazo.');
        avancarTempo(1);
        conferir(alvo.classList.contains('aguardando-toque'), 'O destaque não pulsa após a espera.');
        clicar('btn-inicio');
        avancarTempo(CONFIG.tutorial.tempoDestaqueMs * 2);
        conferir(!document.querySelector('.alvo-tutorial, .aguardando-toque'), 'Início deixou um destaque ou lembrete pendente.');
        conferir(tela('dante') && el('tela-galeria').inert && el('progresso-tutorial').textContent.startsWith('1 /'), 'Início não restaurou a ajuda.');
    });
    await testar('Toque no card conclui o tutorial, abre conteúdo e áudio e libera os outros animais', async () => {
        abrirPassoInterativo();
        const alvo = el(`card-${CONFIG.tutorial.animalId}`);
        alvo.click();
        conferir(tela('galeria') && !document.body.classList.contains('tutorial-ativo'), 'O tutorial não terminou.');
        conferir(!el('modal-animal').hidden && reproducoes.at(-1).src.endsWith(`/${CONFIG.tutorial.animalId}/audio.mp3`), 'O primeiro animal não abriu com som.');
        conferir(!el('guia-fechar-animal').hidden && el('btn-fechar-animal').classList.contains('alvo-fechar-tutorial'), 'Dante não orientou a fechar pelo X.');
        conferir(el('complemento-guia-animal').textContent === CONFIG.dante.etapas.find((etapa) => etapa.aoAbrirAnimal).complemento, 'A última fala não veio da configuração.');
        conferir(el('progresso-guia-animal').textContent === `${etapasDante.length} / ${etapasDante.length}`, 'O progresso não chegou à última etapa.');
        conferir(document.activeElement === el('btn-fechar-animal') && el('app').inert, 'O X não recebeu foco ou o fundo continuou interativo.');
        conferir([...el('grid-animais').children].every((card) => !card.inert) && !el('tela-galeria').inert, 'A galeria permaneceu bloqueada.');
        await esperarQuadro();
        // A janela anima por 220ms; mede a área de toque no estado final.
        await new Promise((resolver) => setTimeoutOriginal(resolver, 250));
        const guia = el('guia-fechar-animal').getBoundingClientRect();
        const painel = el('modal-animal').querySelector('.modal-animal-content');
        const caixaPainel = painel.getBoundingClientRect();
        const elementoBalao = el('fala-guia-animal').closest('.balao-dante');
        const balao = elementoBalao.getBoundingClientRect();
        const fechar = el('btn-fechar-animal').getBoundingClientRect();
        conferir(!painel.contains(el('guia-fechar-animal')), 'Dante continua dentro do painel de descrição.');
        conferir(elementoBalao.contains(document.elementFromPoint(balao.x + balao.width / 2, balao.y + balao.height / 2)), 'A orientação não está à frente da janela do animal.');
        ocultarGuiaFecharAnimal();
        const caixaSemGuia = painel.getBoundingClientRect();
        conferir(['x', 'y', 'width', 'height'].every((medida) => Math.abs(caixaPainel[medida] - caixaSemGuia[medida]) < 1), 'Dante alterou o tamanho ou a posição do painel de informações.');
        mostrarGuiaFecharAnimal();
        conferir(guia.left >= 0 && guia.right <= innerWidth && guia.top >= 0 && guia.bottom <= innerHeight, 'A orientação saiu da janela.');
        conferir(el('btn-fechar-animal').contains(document.elementFromPoint(fechar.x + fechar.width / 2, fechar.y + fechar.height / 2)), 'Dante está cobrindo o X.');
        clicar('btn-fechar-animal');
        avancarTempo(220);
        conferir(el('guia-fechar-animal').hidden && !el('btn-fechar-animal').classList.contains('alvo-fechar-tutorial'), 'A orientação do X permaneceu após fechar.');
        conferir(document.activeElement === alvo, 'Fechar não devolveu o foco ao card.');
        conferir(!document.querySelector('.alvo-tutorial, .aguardando-toque'), 'O destaque do tutorial permaneceu após fechar o animal.');
        // Aguarda também a transição normal de hover/foco antes de medir a cor.
        await new Promise((resolver) => setTimeoutOriginal(resolver, 250));
        const estilo = getComputedStyle(alvo);
        const amarelo = 'rgb(240, 199, 94)';
        conferir(estilo.borderColor !== amarelo && estilo.outlineColor !== amarelo, 'O amarelo reapareceu no card após o X.');
        clicar('card-anta');
        conferir(el('modal-titulo').textContent === 'Anta', 'O segundo animal não abriu.');
        conferir(el('guia-fechar-animal').hidden, 'A orientação apareceu novamente ao explorar outro animal.');
        clicar('btn-fechar-animal');
        avancarTempo(220);
        conferir(!document.querySelector('.alvo-tutorial, .aguardando-toque'), 'Um destaque permaneceu após a conclusão.');
    });
    await testar('Inatividade preserva a orientação ao continuar e a limpa ao reiniciar', async () => {
        abrirPassoInterativo();
        clicar(`card-${CONFIG.tutorial.animalId}`);
        avancarTempo(105000);
        await esperarQuadro();
        conferir(!el('modal-inatividade').hidden && el('modal-animal').inert, 'O aviso não ficou acima da última orientação.');
        clicar('btn-continuar');
        avancarTempo(220);
        conferir(!el('guia-fechar-animal').hidden && !el('modal-animal').inert, 'Continuar perdeu a orientação.');
        avancarTempo(120000);
        conferir(tela('dante') && el('fala-dante').textContent === CONFIG.dante.etapas[0].fala, 'O reinício não voltou às boas-vindas.');
        conferir(el('guia-fechar-animal').hidden && !el('btn-fechar-animal').hasAttribute('aria-describedby'), 'O reinício deixou a orientação do X ativa.');
        abrirPassoInterativo();
        clicar(`card-${CONFIG.tutorial.animalId}`);
        conferir(!el('guia-fechar-animal').hidden, 'A orientação não reapareceu na nova experiência.');
        reiniciarExperiencia();
        conferir(el('guia-fechar-animal').hidden, 'Início não limpou a orientação.');
    });
    await testar('A orientação final pode ser dispensada por toque sem fechar a ficha do animal', () => {
        abrirPassoInterativo();
        clicar(`card-${CONFIG.tutorial.animalId}`);
        conferir(!el('guia-fechar-animal').hidden, 'O toque do card dispensou a orientação na mesma ação.');
        clicar('fala-guia-animal');
        conferir(el('guia-fechar-animal').hidden && !el('modal-animal').hidden && estado.animalAberto.id === CONFIG.tutorial.animalId,
            'Tocar na orientação não a dispensou ou fechou a ficha.');
        conferir(!el('btn-fechar-animal').hasAttribute('aria-describedby'), 'A orientação dispensada ficou associada ao X.');
        clicar('btn-fechar-animal');
        avancarTempo(220);
        abrirPassoInterativo();
        clicar(`card-${CONFIG.tutorial.animalId}`);
        clicar('modal-animal');
        conferir(el('guia-fechar-animal').hidden && !el('modal-animal').hidden, 'Tocar no fundo fechou a ficha antes de dispensar a orientação.');
        clicar('modal-animal');
        avancarTempo(220);
        conferir(el('modal-animal').hidden, 'O fundo não voltou a fechar a ficha após a orientação.');
    });
    await testar('Tutorial exige tocar no animal; a inatividade começa somente após a conclusão', () => {
        abrirPassoInterativo();
        avancarTempo(240000);
        conferir(tela('dante') && el('modal-inatividade').hidden, 'A inatividade interrompeu o tutorial.');
        tocarTela();
        avancarApresentacao();
        conferir(tela('dante') && el('aviso-avancar-dante').hidden, 'Foi possível pular a etapa interativa.');
        concluirTutorial();
        conferir(tela('galeria') && el('modal-animal').hidden, 'O toque e o X não liberaram a galeria.');
        avancarTempo(104999);
        conferir(el('modal-inatividade').hidden && !document.querySelector('.aguardando-toque'), 'Um prazo antigo permaneceu após concluir a ajuda.');
        avancarTempo(1);
        conferir(!el('modal-inatividade').hidden, 'Concluir o tutorial não iniciou a inatividade da galeria.');
        reiniciarExperiencia();
    });
    if (!comVideo) await testar('Vídeo desativado não carrega e não pode ser aberto', () => {
        abrirGaleria();
        conferir(el('tela-video').hidden && !el('player-video').hasAttribute('src'), 'O vídeo desativado ainda foi preparado para reprodução.');
        mudarTela('video');
        conferir(tela('galeria'), 'A navegação abriu o vídeo desativado.');
        reiniciarExperiencia();
        tocarTela();
        clicar('seta-voltar-video');
        conferir(tela('dante'), 'A seta oculta abriu o vídeo desativado.');
        el('player-video').dispatchEvent(new Event('ended'));
        conferir(tela('dante') && etapasDante[estado.etapaDanteAtual].aposVideo, 'Um evento do vídeo alterou o convite.');
    });
    await testar('Galeria não tem seta de retorno; Início restaura as boas-vindas', () => {
        abrirGaleria();
        conferir(!el('seta-voltar'), 'A seta redundante da galeria permanece.');
        clicar('btn-inicio');
        conferir(tela('dante') && estado.etapaDanteAtual === 0, 'Início não voltou às boas-vindas.');
        abrirGaleria();
        conferir(tela('galeria'), 'Não conseguiu reabrir a galeria.');
    });
    await testar('Animal mostra conteúdo, parágrafos, referências e toca áudio', () => {
        clicar('card-gato-mourisco');
        conferir(!el('modal-animal').hidden, 'Modal não abriu.');
        conferir(el('modal-titulo').textContent === 'Gato-Mourisco', 'Título incorreto.');
        conferir(el('modal-texto').children.length === 3, 'Quebras de parágrafo perdidas.');
        conferir(!el('modal-fonte').hidden && !el('modal-credito-imagem').hidden, 'Referências preenchidas não aparecem.');
        conferir(reproducoes.at(-1).src.endsWith('/gato-mourisco/audio.mp3'), 'Áudio incorreto.');
        clicar('btn-fechar-animal');
        conferir(pausas.includes(reproducoes.at(-1)), 'Fechar não interrompeu o áudio.');
        avancarTempo(220);
    });
    await testar('Foto alternativa e crédito vazio são respeitados', () => {
        clicar('card-coruja');
        conferir(el('modal-img').src.endsWith('/coruja/imagem-modal.png'), 'Foto alternativa ignorada.');
        conferir(el('modal-credito-imagem').hidden, 'Crédito vazio foi exibido.');
    });
    await testar('X continua visível e recebe toque depois de rolar a descrição do animal', async () => {
        abrirGaleria();
        clicar('card-bugio');
        const painel = el('modal-animal').querySelector('.modal-animal-content');
        const limiteAnterior = painel.style.maxHeight;
        try {
            // Exercita a rolagem também em monitores nos quais o texto inteiro cabe.
            painel.style.maxHeight = '240px';
            await esperarQuadro();
            await Promise.all(painel.getAnimations().map((animacao) => animacao.finished));
            await esperarQuadro();
            const antes = el('btn-fechar-animal').getBoundingClientRect();
            const painelAntes = painel.getBoundingClientRect();
            painel.scrollTop = painel.scrollHeight;
            await esperarQuadro();
            const depois = el('btn-fechar-animal').getBoundingClientRect();
            const painelDepois = painel.getBoundingClientRect();
            conferir(painel.scrollTop > 0, 'A descrição não foi rolada.');
            conferir(Math.abs(depois.y - antes.y) < 1, `O X saiu do lugar ao rolar a descrição (${antes.y} → ${depois.y}).`);
            conferir(['x', 'y', 'width', 'height'].every((medida) => Math.abs(painelAntes[medida] - painelDepois[medida]) < 1), 'Rolar alterou as dimensões ou a posição do painel.');
            const atingido = document.elementFromPoint(depois.x + depois.width / 2, depois.y + depois.height / 2);
            conferir(el('btn-fechar-animal').contains(atingido), 'O X ficou coberto depois de rolar a descrição.');
            clicar('btn-fechar-animal');
            avancarTempo(220);
            clicar('card-gato-mourisco');
            conferir(painel.scrollTop === 0, 'O próximo animal herdou a rolagem da descrição anterior.');
            await el('modal-img').decode();
            await esperarQuadro();
            conferir(painel.scrollTop === 0, 'O carregamento da imagem deslocou a descrição do próximo animal.');
        } finally {
            painel.style.maxHeight = limiteAnterior;
            clicar('btn-fechar-animal');
            avancarTempo(220);
        }
    });
    await testar('Mute interrompe áudio; repetir reativa o som global', () => {
        abrirGaleria();
        clicar('card-coruja');
        clicar('btn-som');
        conferir(el('player-video').muted, 'Vídeo não foi silenciado.');
        conferir(!el('modal-status-som').classList.contains('tocando'), 'Indicador de áudio ainda ativo.');
        clicar('btn-repetir-som');
        conferir(!el('player-video').muted && el('btn-som').getAttribute('aria-pressed') === 'false', 'Repetir não reativou o som.');
        clicar('btn-fechar-animal');
        avancarTempo(220);
    });
    await testar('Erros de mídia mostram mensagens', async () => {
        clicar('card-anta');
        reproducoes.at(-1).dispatchEvent(new Event('error'));
        conferir(el('modal-status-som').textContent === 'Áudio ainda não adicionado', 'Falta mensagem de áudio.');
        clicar('btn-fechar-animal');
        avancarTempo(220);
        if (comVideo) {
            el('player-video').dispatchEvent(new Event('error'));
            conferir(!el('erro-video').hidden, 'Falta mensagem de vídeo.');
        }
        await Promise.resolve();
    });
    await testar('Inatividade só funciona na galeria: aviso em 105s e reinício em 120s', async () => {
        abrirGaleria();
        avancarTempo(104999);
        conferir(el('modal-inatividade').hidden, 'Aviso adiantado.');
        avancarTempo(1);
        conferir(!el('modal-inatividade').hidden && el('contador-inatividade').textContent === '15', 'Aviso não abriu em 105s.');
        await esperarQuadro();
        avancarTempo(14999);
        conferir(tela('galeria'), 'Reiniciou antes de 120s.');
        avancarTempo(1);
        conferir(tela('dante') && el('modal-inatividade').hidden, 'Não reiniciou em 120s.');
        avancarTempo(240000);
        conferir(tela('dante') && el('modal-inatividade').hidden, 'Há inatividade na apresentação.');
        tocarTela();
        avancarTempo(240000);
        conferir(tela('dante') && el('modal-inatividade').hidden, 'Há inatividade na segunda fala do Dante.');
        if (comVideo) {
            tocarTela();
            avancarTempo(240000);
            conferir(tela('video') && el('modal-inatividade').hidden, 'Há inatividade no vídeo.');
        }
    });
    await testar('Voltar ao navegador preserva o prazo e reinicia nas boas-vindas do CDCC', () => {
        abrirGaleria();
        avancarTempo(104000);
        window.dispatchEvent(new Event('focus'));
        document.dispatchEvent(new Event('visibilitychange'));
        avancarTempo(1000);
        conferir(!el('modal-inatividade').hidden, 'Voltar à janela renovou indevidamente o prazo.');
        avancarTempo(15000);
        conferir(tela('dante') && el('fala-dante').textContent === CONFIG.dante.etapas[0].fala, 'O prazo não restaurou a apresentação do CDCC.');
        conferir(!el('aviso-avancar-dante').hidden && el('progresso-tutorial').textContent.startsWith('1 /'), 'A primeira etapa não foi restaurada.');
        conferir(el('tela-galeria').inert && !document.querySelector('.alvo-tutorial, .aguardando-toque'), 'O tutorial não voltou ao estado inicial.');
    });
    await testar('Prazo vencido com callbacks suspensos reinicia ao voltar ou tocar no painel', () => {
        for (const evento of ['focus', 'visibilitychange', 'pointerdown']) {
            abrirGaleria();
            if (evento === 'focus') clicar('card-bugio');
            if (evento === 'visibilitychange') { clicar('btn-reinicio'); tecla('1'); }
            // Simula o relógio avançando enquanto o navegador suspende os callbacks.
            agora += CONFIG.tempoInatividadeMs + 1;
            (evento === 'focus' ? window : document).dispatchEvent(new Event(evento));
            conferir(tela('dante') && el('fala-dante').textContent === CONFIG.dante.etapas[0].fala, `${evento} descartou o prazo vencido.`);
            conferir([...document.querySelectorAll('.modal-overlay')].every((modal) => modal.hidden), 'O reinício deixou um modal aberto.');
            conferir(el('senha-mediacao').value === '' && !el('app').inert, 'O reinício não limpou o PIN ou liberou a apresentação.');
        }
    });
    await testar('Toque e tecla renovam o prazo; continuar fecha o aviso', async () => {
        abrirGaleria();
        avancarTempo(100000);
        document.dispatchEvent(new Event('pointerdown'));
        avancarTempo(100000);
        tecla('a');
        avancarTempo(104999);
        conferir(el('modal-inatividade').hidden, 'Interação não renovou o prazo.');
        avancarTempo(1);
        await esperarQuadro();
        clicar('btn-continuar');
        avancarTempo(220);
        conferir(el('modal-inatividade').hidden && tela('galeria'), 'Continuar não fechou o aviso.');
    });
    await testar('PIN: teclado com zero centralizado, quatro dígitos e rejeição de senha incorreta', () => {
        abrirGaleria();
        clicar('btn-reinicio');
        const botoes = [...el('teclado-senha').children];
        conferir(botoes.map((botao) => botao.textContent).join('') === '1234567890', 'Teclado incompleto.');
        conferir(getComputedStyle(botoes.at(-1)).gridColumnStart === '2', 'Zero não está centralizado.');
        for (const digito of '00000') tecla(digito);
        conferir(el('senha-mediacao').value === '0000', 'Limite de quatro dígitos perdido.');
        tecla('Enter');
        conferir(el('erro-senha').textContent.includes('incorreto'), 'PIN incorreto foi aceito.');
        conferir(el('btn-reinicio').getAttribute('aria-pressed') === 'false', 'PIN incorreto pausou o reinício.');
    });
    await testar('PIN: mostrar, apagar, limpar e cancelar funcionam', () => {
        tecla('1'); tecla('2');
        clicar('btn-mostrar-senha');
        conferir(el('senha-mediacao').type === 'text', 'Mostrar não funciona.');
        clicar('btn-apagar-senha');
        conferir(el('senha-mediacao').value === '1', 'Apagar não funciona.');
        clicar('btn-limpar-senha');
        conferir(el('senha-mediacao').value === '', 'Limpar não funciona.');
        tecla('Escape');
        avancarTempo(220);
        conferir(el('modal-senha').hidden && document.activeElement === el('btn-reinicio'), 'Cancelar não devolveu o foco.');
    });
    await testar('PIN: Enter e Espaço preservam a ativação dos botões focados', () => {
        clicar('btn-reinicio');
        for (const digito of CONFIG.senhaMediacao) tecla(digito);
        for (const botao of el('modal-senha').querySelectorAll('button')) {
            for (const key of ['Enter', ' ']) {
                const evento = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
                botao.dispatchEvent(evento);
                conferir(!evento.defaultPrevented, `${botao.id || botao.textContent}: ${key} foi bloqueado.`);
                conferir(!estado.reinicioAutomaticoPausado, 'Uma tecla no botão errado confirmou o PIN.');
            }
        }
        clicar('btn-fechar-senha');
        avancarTempo(220);
    });
    await testar('PIN correto pausa a sessão ao explorar; reativar dá prazo completo', async () => {
        clicar('btn-reinicio');
        for (const digito of CONFIG.senhaMediacao) el('teclado-senha').querySelector(`[data-caractere="${digito}"]`).click();
        clicar('btn-confirmar-senha');
        avancarTempo(220);
        avancarTempo(240000);
        window.dispatchEvent(new Event('focus'));
        document.dispatchEvent(new Event('visibilitychange'));
        conferir(tela('galeria') && el('modal-inatividade').hidden, 'A pausa não suspendeu a inatividade.');
        clicar('card-anta');
        clicar('btn-fechar-animal');
        avancarTempo(220);
        avancarTempo(240000);
        conferir(tela('galeria') && el('modal-inatividade').hidden, 'Explorar os animais perdeu a pausa.');
        clicar('btn-reinicio');
        avancarTempo(104999);
        conferir(el('modal-inatividade').hidden, 'Reativar não deu prazo completo.');
        avancarTempo(1);
        await esperarQuadro();
        conferir(!el('modal-inatividade').hidden, 'Reativação não restaurou o aviso.');
    });
    await testar('Abrir o teclado não pausa a inatividade; aviso fecha e limpa o PIN', async () => {
        abrirGaleria();
        clicar('btn-reinicio'); tecla('1'); tecla('9');
        avancarTempo(105000);
        await esperarQuadro();
        avancarTempo(220);
        conferir(!el('modal-inatividade').hidden && el('modal-senha').hidden, 'Aviso não substituiu o teclado.');
        conferir(el('senha-mediacao').value === '', 'PIN ficou preenchido.');
    });
    await testar('Início limpa modais e PIN, restaura som e reinício automático', () => {
        abrirGaleria(); clicar('btn-som'); clicar('btn-reinicio'); tecla('1'); clicar('btn-inicio');
        conferir(tela('dante') && el('senha-mediacao').value === '', 'Início não limpou a sessão.');
        conferir(el('fala-dante').textContent === CONFIG.dante.etapas[0].fala, 'Início não restaurou as boas-vindas.');
        conferir(el('indicador-etapas').firstElementChild.getAttribute('aria-current') === 'step', 'Início não restaurou o progresso.');
        conferir([...document.querySelectorAll('.modal-overlay')].every((modal) => modal.hidden), 'Algum modal ficou aberto.');
        conferir(!el('player-video').muted && el('btn-reinicio').getAttribute('aria-pressed') === 'false', 'Som ou reinício não restaurado.');
    });
    await testar('Fechamento atrasado não esconde um modal reaberto', async () => {
        abrirGaleria(); clicar('card-anta');
        await esperarQuadro();
        clicar('btn-fechar-animal');
        avancarTempo(100);
        clicar('card-bugio');
        await esperarQuadro();
        avancarTempo(120);
        conferir(!el('modal-animal').hidden && el('modal-animal').classList.contains('ativo'), `Modal reaberto: hidden=${el('modal-animal').hidden}, classes=${el('modal-animal').className}, visibilidade=${document.visibilityState}.`);
        conferir(el('modal-titulo').textContent === 'Bugio', 'Conteúdo antigo reapareceu.');
    });
    await testar('Foco fica no animal e retorna ao card; fundo permanece inativo', () => {
        conferir(document.activeElement === el('btn-fechar-animal') && el('app').inert, 'Abertura não isolou o foco.');
        tecla('Tab', { shiftKey: true });
        conferir(document.activeElement === el('btn-repetir-som'), 'Shift+Tab saiu do modal.');
        tecla('Tab');
        conferir(document.activeElement === el('btn-fechar-animal'), 'Tab saiu do modal.');
        tecla('Escape'); avancarTempo(220);
        conferir(document.activeElement === el('card-bugio') && !el('app').inert, 'Foco não voltou ao card.');
    });
    await testar('Foco fica no teclado de PIN e volta ao controle', () => {
        clicar('btn-reinicio');
        el('btn-fechar-senha').focus();
        tecla('Tab', { shiftKey: true });
        conferir(document.activeElement === el('btn-apagar-senha'), 'PIN incompleto entrou no ciclo de foco.');
        tecla('Tab');
        conferir(document.activeElement === el('btn-fechar-senha'), 'Foco escapou do teclado.');
        tecla('Escape'); avancarTempo(220);
        conferir(document.activeElement === el('btn-reinicio'), 'Foco não voltou ao controle.');
    });
    await testar('Aviso sobre o animal contém o foco e permite continuar no mesmo animal', async () => {
        abrirGaleria(); clicar('card-anta');
        avancarTempo(105000); await esperarQuadro();
        conferir(document.activeElement === el('btn-continuar'), 'Aviso não recebeu foco.');
        conferir(el('modal-animal').inert, 'Animal continuou interativo sob o aviso.');
        tecla('Tab');
        conferir(document.activeElement === el('btn-continuar'), 'Tab saiu do aviso.');
        tecla('Escape'); avancarTempo(220);
        conferir(!el('modal-animal').hidden && !el('modal-animal').inert, 'Continuar fechou o animal.');
        conferir(document.activeElement === el('btn-fechar-animal'), 'Foco não voltou ao animal.');
    });
    await testar('Evento ou rejeição atrasada de áudio não altera o próximo animal', async () => {
        abrirGaleria();
        let rejeitar;
        proximaReproducao = () => new Promise((resolver, recusar) => { rejeitar = recusar; });
        clicar('card-anta');
        const antigo = reproducoes.at(-1);
        clicar('btn-fechar-animal'); avancarTempo(220); clicar('card-bugio');
        const status = el('modal-status-som').textContent;
        antigo.dispatchEvent(new Event('ended'));
        antigo.dispatchEvent(new Event('error'));
        rejeitar(new Error('Reprodução anterior cancelada'));
        await Promise.resolve();
        conferir(el('modal-status-som').textContent === status, 'Áudio antigo sobrescreveu o status do novo.');
    });
    if (comVideo) await testar('Rejeição de um play anterior não mostra erro ao rever o vídeo', async () => {
        reiniciarExperiencia(); tocarTela();
        let rejeitar;
        proximaReproducao = () => new Promise((resolver, recusar) => { rejeitar = recusar; });
        tocarTela(); clicar('seta-avancar'); clicar('seta-voltar-video');
        rejeitar(new DOMException('Tentativa anterior', 'NotAllowedError'));
        await Promise.resolve();
        conferir(tela('video') && el('erro-video').hidden, 'Tentativa anterior mostrou erro no vídeo novo.');
    });
    if (comVideo) await testar('Erro real de play do vídeo continua visível', async () => {
        clicar('seta-avancar');
        proximaReproducao = () => Promise.reject(new DOMException('Teste', 'NotAllowedError'));
        clicar('seta-voltar-video');
        await Promise.resolve();
        conferir(!el('erro-video').hidden, 'Erro atual não foi exibido.');
    });
    await testar('Falhas de imagem usam substitutos sem repetição infinita', () => {
        abrirGaleria(); clicar('card-anta');
        const imagem = el('modal-img');
        imagem.dispatchEvent(new Event('error'));
        conferir(imagem.src.startsWith('data:image/svg+xml'), 'Foto do modal sem substituto.');
        const substituta = imagem.src;
        imagem.dispatchEvent(new Event('error'));
        conferir(imagem.src === substituta, 'Substituto falhou de forma recursiva.');
        const card = el('card-anta').querySelector('img');
        card.dispatchEvent(new Event('error'));
        conferir(card.src.startsWith('data:image/svg+xml'), 'Card sem substituto.');
    });
    await testar('Galeria mantém o mosaico em telas grandes e cards uniformes em telas menores', () => {
        abrirGaleria();
        const cards = [...document.querySelectorAll('.card')];
        const caixas = cards.map((card) => card.getBoundingClientRect());
        conferir(caixas.every((r) => r.width > 0 && r.height > 0), 'Há cards sem área visível.');
        for (let i = 0; i < caixas.length; i += 1) {
            for (let j = i + 1; j < caixas.length; j += 1) {
                const a = caixas[i]; const b = caixas[j];
                conferir(a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1, 'Há cards sobrepostos.');
            }
        }
        if (innerWidth > 1100) {
            conferir(caixas.every((r) => r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight), 'Mosaico saiu da janela.');
            conferir(getComputedStyle(cards[7]).gridColumn === '3 / span 2', 'Posição da jaguatirica alterada.');
        } else {
            conferir(caixas.every((r) => Math.abs(r.width - caixas[0].width) < 1 && Math.abs(r.height - caixas[0].height) < 1), 'Cards deixaram de ser uniformes.');
        }
        conferir(getComputedStyle(el('card-tamandua').querySelector('img')).objectPosition === '50% 20%', 'Recorte do tamanduá foi alterado.');
        if (!comVideo) conferir(!reproducoes.includes(el('player-video')), 'Algum fluxo reproduziu o vídeo desativado.');
    });
    concluir({ testes, erros });
}

executarTestes().catch((erro) => concluir({ testes, erros: [...erros, erro.stack] }));
