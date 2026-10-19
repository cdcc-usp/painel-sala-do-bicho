#!/usr/bin/env python3
"""Executa a regressão no Firefox usando apenas a biblioteca padrão do Python."""

import argparse
import base64
import json
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time


class Navegador:
    def __init__(self, conexao):
        self.conexao = conexao
        self.indice = 0
        self.receber()  # Saudação do protocolo Marionette, incluído no Firefox.

    def receber(self):
        prefixo = b''
        while not prefixo.endswith(b':'):
            trecho = self.conexao.recv(1)
            if not trecho:
                raise RuntimeError('O Firefox encerrou a conexão.')
            prefixo += trecho
        tamanho = int(prefixo[:-1])
        dados = b''
        while len(dados) < tamanho:
            trecho = self.conexao.recv(tamanho - len(dados))
            if not trecho:
                raise RuntimeError('Resposta incompleta do Firefox.')
            dados += trecho
        return json.loads(dados)

    def comando(self, nome, parametros=None):
        self.indice += 1
        dados = json.dumps([0, self.indice, nome, parametros or {}]).encode()
        self.conexao.sendall(str(len(dados)).encode() + b':' + dados)
        _, _, erro, resultado = self.receber()
        if erro:
            raise RuntimeError(f'{nome}: {erro}')
        return resultado.get('value', resultado) if isinstance(resultado, dict) else resultado


def capturar(navegador, destino):
    destino.mkdir(parents=True, exist_ok=True)
    # Capturas mostram o estado final, sem depender do compositor do modo headless.
    # A navegação abaixo recarrega a página antes de executar a regressão.
    navegador.comando('WebDriver:ExecuteScript', {
        'script': '''
            const estilo = document.createElement('style');
            estilo.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
            document.head.appendChild(estilo);
        ''',
        'args': [],
    })
    cenas = {
        'dante': '',
        'convite': 'mostrarOrientacoesDante();',
        'tutorial': 'mostrarOrientacoesDante(); avancarApresentacao();',
        'tutorial-fechar': "document.querySelector('.alvo-tutorial').click();",
        'galeria': "fecharAnimal(); mudarTela('galeria');",
        'animal': "abrirAnimal('coruja');",
    }
    if navegador.comando('WebDriver:ExecuteScript', {
        'script': "return !document.getElementById('tela-video').hidden;", 'args': [],
    }):
        cenas['video'] = "reiniciarExperiencia(); mudarTela('video');"
    medidas = {}
    for nome, acao in cenas.items():
        medidas[nome] = navegador.comando('WebDriver:ExecuteAsyncScript', {
            'script': acao + '''
                const concluir = arguments[arguments.length - 1];
                requestAnimationFrame(() => requestAnimationFrame(() => {
                setTimeout(() => concluir({
                    janela: [innerWidth, innerHeight],
                    visibilidade: document.visibilityState,
                    modais: Array.from(document.querySelectorAll('.modal-overlay'), (modal) => ({
                        id: modal.id, hidden: modal.hidden, classe: modal.className,
                        opacidade: getComputedStyle(modal).opacity,
                    })),
                    cards: Array.from(document.querySelectorAll('.card'), (card) => {
                        const r = card.getBoundingClientRect();
                        return [card.id, r.x, r.y, r.width, r.height];
                    }),
                }), 400);
                }));
            ''',
            'args': [],
        })
        if nome == 'animal':
            modal = medidas[nome]['modais'][0]
            if modal['hidden'] or float(modal['opacidade']) < 1:
                raise RuntimeError('O modal não ficou visível antes da captura.')
        foto = navegador.comando('WebDriver:TakeScreenshot', {'full': False})
        (destino / f'{nome}.png').write_bytes(base64.b64decode(foto))
    (destino / 'medidas.json').write_text(json.dumps(medidas, indent=4))


def executar(opcoes):
    raiz = Path(__file__).resolve().parent.parent
    with tempfile.TemporaryDirectory(prefix='painel-testes-') as temporario:
        pasta = Path(temporario)
        with socket.socket() as reserva:
            reserva.bind(('127.0.0.1', 0))
            porta = reserva.getsockname()[1]
        preferencias = {
            'marionette.port': porta,
            'browser.shell.checkDefaultBrowser': False,
            'browser.aboutwelcome.enabled': False,
            'browser.startup.homepage_override.mstone': 'ignore',
            'datareporting.policy.dataSubmissionEnabled': False,
            'focusmanager.testmode': True,
            'layout.frame_rate': 60,
        }
        (pasta / 'user.js').write_text(''.join(
            f'user_pref({json.dumps(chave)}, {json.dumps(valor)});\n'
            for chave, valor in preferencias.items()
        ))
        with (pasta / 'firefox.log').open('w+') as log:
            processo = subprocess.Popen([
                opcoes.firefox, '--headless', '--no-remote', '--marionette',
                '--profile', str(pasta),
            ], stdout=log, stderr=log)
            try:
                limite = time.monotonic() + 20
                while True:
                    try:
                        conexao = socket.create_connection(('127.0.0.1', porta), timeout=1)
                        break
                    except OSError:
                        if processo.poll() is not None or time.monotonic() > limite:
                            log.seek(0)
                            raise RuntimeError(f'Não foi possível iniciar o Firefox:\n{log.read()}')
                        time.sleep(0.1)
                with conexao:
                    conexao.settimeout(60)
                    navegador = Navegador(conexao)
                    navegador.comando('WebDriver:NewSession', {'capabilities': {}})
                    janela = navegador.comando('WebDriver:GetWindowHandle')
                    navegador.comando('WebDriver:SwitchToWindow', {'handle': janela})
                    navegador.comando('WebDriver:SetTimeouts', {'script': 60000})
                    navegador.comando('WebDriver:SetWindowRect', {'width': opcoes.largura, 'height': opcoes.altura})
                    margens = navegador.comando('WebDriver:ExecuteScript', {
                        'script': 'return {largura: outerWidth - innerWidth, altura: outerHeight - innerHeight};',
                        'args': [],
                    })
                    navegador.comando('WebDriver:SetWindowRect', {
                        'width': opcoes.largura + margens['largura'],
                        'height': opcoes.altura + margens['altura'],
                    })
                    endereco = opcoes.url or (raiz / 'index.html').as_uri()
                    navegador.comando('WebDriver:Navigate', {'url': endereco})
                    tamanho = navegador.comando('WebDriver:ExecuteScript', {
                        'script': 'return [innerWidth, innerHeight];', 'args': [],
                    })
                    print(f'Área útil da página: {tamanho[0]} × {tamanho[1]}', flush=True)
                    if opcoes.capturas:
                        capturar(navegador, Path(opcoes.capturas))
                        navegador.comando('WebDriver:Navigate', {'url': endereco})
                    resultado = navegador.comando('WebDriver:ExecuteAsyncScript', {
                        'script': '''
                            window.concluirTestes = arguments[arguments.length - 1];
                            const script = document.createElement('script');
                            script.textContent = arguments[0];
                            document.body.appendChild(script);
                        ''',
                        'args': [(raiz / 'testes/regressao.js').read_text(encoding='utf-8')],
                        'sandbox': None,
                    })
                    for teste in resultado['testes']:
                        print(f'{"OK" if teste["ok"] else "FALHOU"}: {teste["nome"]}')
                        if not teste['ok']:
                            print(f'    {teste["erro"]}')
                    for erro in resultado['erros']:
                        print(f'ERRO NO NAVEGADOR: {erro}')
                    falhas = sum(not teste['ok'] for teste in resultado['testes'])
                    print(f'\n{len(resultado["testes"])} verificações; {falhas} falha(s).')
                    navegador.comando('WebDriver:DeleteSession')
                    return 1 if falhas or resultado['erros'] else 0
            finally:
                processo.terminate()
                try:
                    processo.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    processo.kill()
                    processo.wait()


if __name__ == '__main__':
    argumentos = argparse.ArgumentParser(description=__doc__)
    argumentos.add_argument('--url', help='Endereço opcional de um servidor local; o padrão é file://.')
    argumentos.add_argument('--firefox', default=shutil.which('firefox'), help='Caminho do Firefox.')
    argumentos.add_argument('--largura', type=int, default=1920)
    argumentos.add_argument('--altura', type=int, default=1080)
    argumentos.add_argument('--capturas', help='Pasta opcional para imagens e medidas das telas ativas.')
    opcoes = argumentos.parse_args()
    if not opcoes.firefox:
        argumentos.error('Instale o Firefox ou informe seu caminho com --firefox.')
    raise SystemExit(executar(opcoes))
