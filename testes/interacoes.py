"""Verificações com entrada WebDriver, relógio e reprodução reais, sem pacotes."""

import time


def verificarInteracoes(navegador, recarregar):
    testes = []

    def js(script, *args):
        return navegador.comando('WebDriver:ExecuteScript', {
            # A injeção acessa também os const/let dos scripts clássicos da página.
            'script': '''
                const trecho = document.createElement('script');
                window.__argumentosInteracao = arguments[1];
                trecho.textContent = 'try { window.__resultadoInteracao = { valor: (function () {'
                    + arguments[0] + '}).apply(null, window.__argumentosInteracao) }; }'
                    + 'catch (erro) { window.__resultadoInteracao = { erro: erro.message }; }';
                document.body.appendChild(trecho);
                trecho.remove();
                const resultado = window.__resultadoInteracao;
                delete window.__argumentosInteracao;
                delete window.__resultadoInteracao;
                if (resultado.erro) throw new Error(resultado.erro);
                return resultado.valor;
            ''',
            'args': [script, list(args)], 'sandbox': None,
        })

    def conferir(condicao, mensagem):
        if not condicao:
            raise AssertionError(mensagem)

    def esperar(script, mensagem, limite=5):
        prazo = time.monotonic() + limite
        while time.monotonic() < prazo:
            if js('return ' + script):
                return
            time.sleep(0.05)
        raise AssertionError(mensagem)

    def clicar(seletor):
        elemento = navegador.comando('WebDriver:FindElement', {
            'using': 'css selector', 'value': seletor,
        })
        navegador.comando('WebDriver:ElementClick', {'id': next(iter(elemento.values()))})

    def tecla(valor, shift=False):
        acoes = [{'type': 'keyDown', 'value': valor}, {'type': 'keyUp', 'value': valor}]
        if shift:
            acoes = [{'type': 'keyDown', 'value': '\ue008'}] + acoes + [{'type': 'keyUp', 'value': '\ue008'}]
        navegador.comando('WebDriver:PerformActions', {'actions': [{
            'type': 'key', 'id': 'teclado-real', 'actions': acoes,
        }]})

    def focar(id):
        js('document.getElementById(arguments[0]).focus();', id)

    def tocarTela(x=30, y=200):
        navegador.comando('WebDriver:PerformActions', {'actions': [{
            'type': 'pointer', 'id': 'toque-tutorial', 'parameters': {'pointerType': 'mouse'},
            'actions': [
                {'type': 'pointerMove', 'origin': 'viewport', 'x': x, 'y': y},
                {'type': 'pointerDown', 'button': 0}, {'type': 'pointerUp', 'button': 0},
            ],
        }]})

    def fecharAnimal():
        clicar('#btn-fechar-animal')
        esperar("document.getElementById('modal-animal').hidden", 'Animal não fechou.')

    def abrirGaleria():
        tocarTela()
        tocarTela()
        if js('return CONFIG.video.ativo;'):
            clicar('#seta-avancar')
            tocarTela()
        clicar('.alvo-tutorial')
        esperar("getComputedStyle(document.getElementById('modal-animal')).opacity === '1'", 'Modal não abriu.')
        fecharAnimal()

    def conferirAudio():
        esperar('audioAtual && audioAtual.readyState >= 2 && audioAtual.played.length > 0 && !audioAtual.error',
                'O áudio real não começou a reproduzir.', limite=10)

    def carregarComErros(temporizadores=False):
        recarregar(temporizadores)
        js('''
            window.__errosInteracao = [];
            window.addEventListener('error', (evento) => {
                if (evento.message) window.__errosInteracao.push(evento.message);
            });
            window.addEventListener('unhandledrejection', (evento) => window.__errosInteracao.push(String(evento.reason)));
        ''')

    def conferirErros():
        erros = js('return window.__errosInteracao;')
        conferir(erros is not None and not erros, f'Erro JavaScript durante a interação: {erros}')

    def testar(nome, verificar, temporizadores=False):
        try:
            carregarComErros(temporizadores)
            verificar()
            conferirErros()
            testes.append({'nome': nome, 'ok': True})
        except Exception as erro:
            testes.append({'nome': nome, 'ok': False, 'erro': str(erro)})
        print(f'{"OK" if testes[-1]["ok"] else "FALHOU"}: {nome}', flush=True)
        if not testes[-1]['ok']:
            print(f'    {testes[-1]["erro"]}', flush=True)

    def controlesDante():
        clicar('#btn-som')
        conferir(js('return !estado.somAtivo;'), 'Som não desligou nas boas-vindas.')
        clicar('#btn-som')
        tocarTela()
        clicar('#btn-inicio')
        conferir(js('return estado.etapaDanteAtual === 0 && estado.somAtivo;'), 'Início não restaurou a sessão.')
        if js('return CONFIG.video.ativo;'):
            tocarTela()
            tocarTela()
            esperar("document.getElementById('player-video').currentTime > 0", 'O vídeo real não começou.')
            clicar('#seta-avancar')
            clicar('#seta-voltar-video')
            esperar("document.getElementById('player-video').currentTime > 0", 'O vídeo real não começou.')
            clicar('#btn-som')
            conferir(js("return document.getElementById('player-video').muted;"), 'Mute não silenciou o vídeo.')
            clicar('#btn-som')
            js("document.getElementById('player-video').pause();")
            conferir(js("return estado.telaAtual === 'video';"), 'Pausar o vídeo avançou a tela.')
            clicar('#seta-avancar')
            clicar('#btn-inicio')
        abrirGaleria()
        conferir(js("return !document.getElementById('seta-voltar');"), 'A galeria ainda tem seta de retorno.')
        clicar('#btn-inicio')

    testar('Entrada real: Som, Início, toque no fundo e galeria sem seta de retorno', controlesDante)

    def avancarTutorial():
        clicar('#fala-dante')
        conferir(js('return estado.etapaDanteAtual === 1;'), 'Tocar na fala não avançou uma única etapa.')
        clicar('#btn-inicio')
        tecla('\ue007')
        conferir(js('return estado.etapaDanteAtual === 1;'), 'Enter não avançou a primeira fala.')
        tecla('\ue00d')
        if js('return CONFIG.video.ativo;'):
            clicar('#seta-avancar')
            clicar('#aviso-avancar-dante')
        etapa = js('return estado.etapaDanteAtual;')
        tocarTela()
        clicar('#fala-dante')
        conferir(js('return estado.etapaDanteAtual;') == etapa, 'Um toque fora do card pulou o gato-mourisco.')
        clicar('.alvo-tutorial')
        esperar("getComputedStyle(document.getElementById('modal-animal')).opacity === '1'", 'Animal guiado não abriu.')
        conferir(js("return !document.getElementById('guia-fechar-animal').hidden;"), 'O toque do card dispensou a última fala.')
        clicar('#fala-guia-animal')
        conferir(js("return document.getElementById('guia-fechar-animal').hidden && !document.getElementById('modal-animal').hidden;"),
                 'A última fala não foi dispensada por toque mantendo a ficha aberta.')
        fecharAnimal()

    testar('Entrada real: fala, teclado e orientação final avançam; gato-mourisco continua obrigatório', avancarTutorial)

    def catalogo():
        abrirGaleria()
        for animal in js('return animais.map(({id, nome}) => ({id, nome}));'):
            clicar('#card-' + animal['id'])
            esperar("getComputedStyle(document.getElementById('modal-animal')).opacity === '1'", 'Modal não ficou visível.')
            conferir(js("return document.getElementById('modal-titulo').textContent; ") == animal['nome'],
                     f'Título incorreto: {animal["id"]}.')
            esperar("document.getElementById('modal-img').complete && document.getElementById('modal-img').naturalWidth > 0",
                    f'Foto não carregou: {animal["id"]}.')
            conferirAudio()
            fecharAnimal()
            conferir(js('return audioAtual === null && estado.animalAberto === null;'), 'Fechar deixou áudio ativo.')

    testar('Entrada real: abrir, carregar foto, reproduzir áudio e fechar os 18 animais', catalogo)

    def som():
        abrirGaleria()
        clicar('#btn-som')
        clicar('#card-coruja')
        conferir(js("return !estado.somAtivo && audioAtual === null && document.getElementById('modal-status-som').textContent === 'Som desativado';"),
                 'Abrir um animal ignorou o mute.')
        clicar('#btn-repetir-som')
        conferirAudio()
        conferir(js("return estado.somAtivo && document.getElementById('btn-som').getAttribute('aria-pressed') === 'false';"),
                 'Repetir não reativou o som global.')
        fecharAnimal()
        clicar('#btn-som')
        clicar('#btn-som')
        clicar('#card-anta')
        conferirAudio()
        fecharAnimal()

    testar('Entrada real: mutar, abrir em silêncio, repetir e desmutar', som)

    def pin():
        abrirGaleria()
        clicar('#btn-reinicio')
        focar('btn-fechar-senha')
        tecla('\ue004', shift=True)  # Shift+Tab
        conferir(js("return document.activeElement.id === 'btn-apagar-senha';"), 'Shift+Tab escapou do teclado.')
        tecla('\ue004')
        conferir(js("return document.activeElement.id === 'btn-fechar-senha';"), 'Tab escapou do teclado.')
        focar('btn-mostrar-senha')
        tecla('\ue007')  # Enter
        conferir(js("return document.getElementById('senha-mediacao').type === 'text';"), 'Enter não ativou Mostrar.')
        tecla('\ue00d')  # Espaço
        conferir(js("return document.getElementById('senha-mediacao').type === 'password';"), 'Espaço não ativou Ocultar.')
        for digito in '00000':
            tecla(digito)
        conferir(js("return document.getElementById('senha-mediacao').value === '0000';"), 'PIN excedeu quatro dígitos.')
        focar('senha-mediacao')
        tecla('\ue007')
        conferir(js("return document.getElementById('erro-senha').textContent.includes('incorreto') && !estado.reinicioAutomaticoPausado;"),
                 'PIN incorreto foi aceito.')
        for digito in js('return CONFIG.senhaMediacao;'):
            tecla(digito)
        focar('btn-limpar-senha')
        tecla('\ue007')
        conferir(js("return document.getElementById('senha-mediacao').value === '' && !estado.reinicioAutomaticoPausado;"),
                 'Enter em Limpar confirmou a pausa.')
        for digito in js('return CONFIG.senhaMediacao;'):
            tecla(digito)
        focar('btn-fechar-senha')
        tecla('\ue007')
        esperar("document.getElementById('modal-senha').hidden", 'Enter não cancelou o teclado.')
        conferir(js('return !estado.reinicioAutomaticoPausado;'), 'Cancelar aceitou o PIN.')
        clicar('#btn-reinicio')
        for digito in js('return CONFIG.senhaMediacao;'):
            clicar(f'#teclado-senha [data-caractere="{digito}"]')
        clicar('#btn-confirmar-senha')
        esperar("document.getElementById('modal-senha').hidden", 'PIN correto não fechou o teclado.')
        conferir(js('return estado.reinicioAutomaticoPausado;'), 'PIN correto não pausou o reinício.')
        clicar('#btn-inicio')
        conferir(js('return !estado.reinicioAutomaticoPausado;'), 'Início não restaurou o reinício.')

    testar('Entrada real: PIN incorreto/correto, teclado físico e botões por Enter/Espaço', pin)

    def inatividade():
        abrirGaleria()
        clicar('#btn-reinicio')
        tecla('1')
        esperar("!document.getElementById('modal-inatividade').hidden", 'Aviso real não abriu.')
        esperar("document.getElementById('modal-senha').hidden", 'Aviso não fechou o PIN.')
        conferir(js("return document.getElementById('senha-mediacao').value === '';"), 'Aviso não limpou o PIN.')
        clicar('#btn-continuar')
        esperar("document.getElementById('modal-inatividade').hidden", 'Continuar não fechou o aviso.')
        clicar('#card-anta')
        esperar("estado.telaAtual === 'dante'", 'Relógio real não retornou ao início.')
        conferir(js("return estado.etapaDanteAtual === 0 && audioAtual === null && [...document.querySelectorAll('.modal-overlay')].every(m => m.hidden) && !document.getElementById('app').inert;"),
                 'Reinício real deixou mídia, modal ou bloqueio pendente.')

    testar('Relógio real: aviso sobre PIN, continuar e reinício com animal aberto', inatividade, temporizadores=True)

    def pausa():
        abrirGaleria()
        clicar('#btn-reinicio')
        for digito in js('return CONFIG.senhaMediacao;'):
            tecla(digito)
        tecla('\ue007')
        esperar("document.getElementById('modal-senha').hidden", 'PIN correto não fechou.')
        time.sleep(js('return CONFIG.tempoInatividadeMs;') / 1000 + 0.2)
        conferir(js("return estado.telaAtual === 'galeria' && document.getElementById('modal-inatividade').hidden;"),
                 'A pausa deixou um temporizador ativo.')
        conferirErros()
        carregarComErros(True)
        conferir(js('return !estado.reinicioAutomaticoPausado && estado.etapaDanteAtual === 0;'), 'Recarregar preservou a pausa.')
        abrirGaleria()
        clicar('#btn-reinicio')
        for digito in js('return CONFIG.senhaMediacao;'):
            tecla(digito)
        tecla('\ue007')
        esperar("document.getElementById('modal-senha').hidden", 'PIN correto não fechou.')
        clicar('#btn-reinicio')
        esperar("!document.getElementById('modal-inatividade').hidden", 'Reativar não restaurou o temporizador.')
        esperar("estado.telaAtual === 'dante'", 'Reativar não restaurou o reinício.')

    testar('Relógio real: PIN suspende reinício; reativar e recarregar restauram o comportamento', pausa, temporizadores=True)
    return testes
