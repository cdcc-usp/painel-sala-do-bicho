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
const tecla = (key, opcoes = {}) => document.dispatchEvent(new KeyboardEvent('keydown', {
    key, bubbles: true, cancelable: true, ...opcoes
}));
const tela = (nome) => el(`tela-${nome}`).classList.contains('ativa');

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
    // Percorre o fluxo real, incluindo a passagem pelo vídeo.
    reiniciarExperiencia();
    clicar('btn-avancar');
    clicar('btn-avancar');
    clicar('seta-avancar');
    clicar('btn-avancar');
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
    await testar('As 39 mídias locais carregam imagens ou metadados reais no navegador', async () => {
        const imagens = new Set([CONFIG.dante.imagem, ...animais.flatMap((animal) => [animal.img, animal.imgModal].filter(Boolean))]);
        await Promise.all([
            ...[...imagens].map((caminho) => carregarMidia(caminho, 'img')),
            ...animais.map((animal) => carregarMidia(animal.audio, 'audio')),
            carregarMidia(CONFIG.video.arquivo, 'video')
        ]);
    });
    await testar('Catálogo: 18 cards na ordem original e IDs únicos', () => {
        const ids = [...document.querySelectorAll('.card')].map((card) => card.id);
        conferir(ids.join(',') === 'card-gato-mourisco,card-gafanhoto,card-cascavel,card-tamandua,card-lobo-guara,card-saua,card-sapo-cururu,card-jaguatirica,card-seriema,card-tatu-galinha,card-raposa-do-campo,card-anta,card-coruja,card-bugio,card-onca-pintada,card-pica-pau,card-jacare,card-onca-parda', 'Ordem ou quantidade alterada.');
        conferir(new Set(ids).size === ids.length, 'Há IDs repetidos.');
    });
    await testar('Apresentação → vídeo; pausa mantém a tela; ended abre as orientações', () => {
        conferir(tela('dante'), 'A aplicação não inicia no Dante.');
        clicar('btn-avancar');
        clicar('btn-avancar');
        conferir(tela('video'), 'O convite não abre o vídeo.');
        el('player-video').dispatchEvent(new Event('pause'));
        conferir(tela('video'), 'Pausar avançou a tela.');
        el('player-video').dispatchEvent(new Event('ended'));
        conferir(tela('dante') && !el('seta-voltar-video').hidden, 'Fim do vídeo não abre as orientações.');
    });
    await testar('Setas permitem rever o vídeo e voltar da galeria às orientações', () => {
        clicar('btn-avancar');
        conferir(tela('galeria'), 'As orientações não abrem a galeria.');
        clicar('seta-voltar');
        clicar('seta-voltar-video');
        conferir(tela('video') && el('player-video').currentTime === 0, 'Não reiniciou o vídeo.');
        clicar('seta-avancar');
        clicar('btn-avancar');
        conferir(tela('galeria'), 'A seta do vídeo não volta ao fluxo.');
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
    await testar('Mute interrompe áudio; repetir reativa o som global', () => {
        clicar('btn-som');
        conferir(el('player-video').muted, 'Vídeo não foi silenciado.');
        conferir(!el('modal-status-som').classList.contains('tocando'), 'Indicador de áudio ainda ativo.');
        clicar('btn-repetir-som');
        conferir(!el('player-video').muted && el('btn-som').getAttribute('aria-pressed') === 'false', 'Repetir não reativou o som.');
        clicar('btn-fechar-animal');
        avancarTempo(220);
    });
    await testar('Erros de áudio e vídeo mostram mensagens', async () => {
        clicar('card-anta');
        reproducoes.at(-1).dispatchEvent(new Event('error'));
        conferir(el('modal-status-som').textContent === 'Áudio ainda não adicionado', 'Falta mensagem de áudio.');
        clicar('btn-fechar-animal');
        avancarTempo(220);
        el('player-video').dispatchEvent(new Event('error'));
        conferir(!el('erro-video').hidden, 'Falta mensagem de vídeo.');
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
        clicar('btn-avancar');
        clicar('btn-avancar');
        avancarTempo(240000);
        conferir(tela('video') && el('modal-inatividade').hidden, 'Há inatividade no vídeo.');
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
    await testar('PIN correto pausa a sessão, inclusive ao rever o vídeo; reativar dá prazo completo', async () => {
        clicar('btn-reinicio');
        for (const digito of CONFIG.senhaMediacao) el('teclado-senha').querySelector(`[data-caractere="${digito}"]`).click();
        clicar('btn-confirmar-senha');
        avancarTempo(220);
        avancarTempo(240000);
        conferir(tela('galeria') && el('modal-inatividade').hidden, 'A pausa não suspendeu a inatividade.');
        clicar('seta-voltar'); clicar('seta-voltar-video'); clicar('seta-avancar'); clicar('btn-avancar');
        avancarTempo(240000);
        conferir(el('modal-inatividade').hidden, 'Rever vídeo perdeu a pausa.');
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
    await testar('Rejeição de um play anterior não mostra erro ao rever o vídeo', async () => {
        reiniciarExperiencia(); clicar('btn-avancar');
        let rejeitar;
        proximaReproducao = () => new Promise((resolver, recusar) => { rejeitar = recusar; });
        clicar('btn-avancar'); clicar('seta-avancar'); clicar('seta-voltar-video');
        rejeitar(new DOMException('Tentativa anterior', 'NotAllowedError'));
        await Promise.resolve();
        conferir(tela('video') && el('erro-video').hidden, 'Tentativa anterior mostrou erro no vídeo novo.');
    });
    await testar('Erro real de play do vídeo continua visível', async () => {
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
    });
    concluir({ testes, erros });
}

executarTestes().catch((erro) => concluir({ testes, erros: [...erros, erro.stack] }));
