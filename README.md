# Painel Interativo — Fauna

Painel educativo offline para o touchscreen do CDCC, feito com HTML, CSS e
JavaScript puro. Não há backend, pacotes para instalar nem etapa de compilação.
A versão exibida vem de `CONFIG.versao`, em `js/config.js`.

O visitante segue este percurso:

**Boas-vindas do Dante → convite → toque guiado em um animal → orientação sobre o X → exploração livre.**

Dante fala sobre o mosaico, com o fundo escurecido e visível. A etapa de toque
ilumina o card do gato-mourisco; após 8 segundos de espera, o contorno pulsa.
É preciso tocar nele para abrir o animal com seu som. Nessa primeira janela,
Dante aparece sobreposto à frente do painel de informações, no mesmo estilo das etapas anteriores,
e orienta a fechar pelo X destacado e escolher outros animais. A fala fica
em `CONFIG.dante.etapas`, marcada com `aoAbrirAnimal: true`.
Ao fechar pelo X, a orientação termina e a galeria fica livre, sem o destaque
amarelo do tutorial. As próximas janelas abrem normalmente, sem repetir a ajuda.
O efeito respeita a preferência por movimento reduzido.

A galeria contém 18 animais com foto, informações e som. A seta volta à mensagem
de convite do Dante. Início restaura as boas-vindas e o progresso da apresentação.
Após dois minutos sem toque ou tecla na galeria, o painel reinicia; o aviso aparece
nos últimos 15 segundos. O mediador pode pausar esse reinício usando um PIN local.
Voltar à aba ou à janela não renova o prazo. Se o navegador suspender os
temporizadores, ao retomar o painel ele confere o horário e restaura as boas-vindas
quando os dois minutos já passaram.

O vídeo e a fala intermediária estão desativados para o lançamento. Para restaurar
o percurso completo, altere `CONFIG.video.ativo` para `true` em `js/config.js` e
recarregue a página. A etapa com `somenteComVideo: true` volta automaticamente;
o código e o arquivo de vídeo foram preservados. Consulte a seção 4 do tutorial.

## Executar

Abra `index.html` diretamente no navegador. Toda a pasta `assets/` deve acompanhar
o projeto; a aplicação não depende de conexão com a internet.

Também é possível servir a pasta localmente:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Acesse `http://127.0.0.1:8080`. Encerre o servidor com `Ctrl+C`.
O navegador definitivo do painel ainda precisa ser escolhido e validado.

## Onde encontrar cada funcionalidade

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura das três telas, controles e modais |
| `js/config.js` | Versão, falas do Dante, PIN, caminhos e tempos em milissegundos |
| `js/dados.js` | Conteúdo e caminhos das mídias dos animais; a ordem define o mosaico |
| `js/main.js` | Inicialização, estado compartilhado, navegação e reinício da experiência |
| `js/galeria.js` | Criação dos cards e preenchimento do modal de cada animal |
| `js/midias.js` | Imagens e substitutos, áudio, vídeo e controle global de som |
| `js/mediacao.js` | PIN, teclado numérico, pausa e prazos de inatividade |
| `js/modais.js` | Abertura, fechamento, animação e foco dos modais |
| `js/tutorial.js` | Sobreposição do Dante, spotlight, lembrete e foco do tutorial |
| `css/style.css` | Tema, layout, mosaico, animações e adaptações de tela |
| `assets/` | Fotografias, áudios, Dante e vídeo locais |
| `testes/` | Regressão executada no Firefox com Python, sem pacotes adicionais |

Os scripts continuam clássicos, compartilhando o escopo global. `config.js` e
`dados.js` vêm primeiro, os arquivos de comportamento depois e `main.js` por último.
A inicialização só ocorre em `DOMContentLoaded`. Essa escolha mantém a abertura
por `file://`, sem exigir módulos, servidor ou compilação.

O objeto `estado`, em `main.js`, reúne a tela atual, etapa do Dante, som, animal
aberto e pausa do reinício. Referências ao HTML ficam em `elementos`, preenchido
por `mapearElementos()`. Cada arquivo de comportamento registra seus eventos na
inicialização; eventos globais de navegação, teclado e visibilidade ficam em `main.js`.
Temporizadores e controles de mídia permanecem nos arquivos que os utilizam.
Não há armazenamento persistente, autenticação remota ou chamadas a APIs.

## Testar

Requisitos apenas para a automação: **Python 3 e Firefox** disponíveis na máquina.
A execução normal do painel não precisa de Python.

```bash
python3 testes/executar.py
python3 testes/executar.py --largura 3840 --altura 2160
python3 testes/executar.py --largura 1024 --altura 768
python3 testes/executar.py --largura 390 --altura 844
```

O teste abre um perfil temporário do Firefox em modo headless, controla-o por uma
conexão local e retorna código diferente de zero se houver falhas. Por padrão,
abre `index.html` via `file://`. Para conferir um servidor local já iniciado:

```bash
python3 testes/executar.py --url http://127.0.0.1:8080
```

Use `--firefox /caminho/do/firefox` se o executável não estiver no PATH.
`--capturas /tmp/painel-capturas` salva imagens das telas e medidas dos cards.
A saída informa a área útil real; o Firefox pode limitar a largura mínima da janela.

A regressão verifica o carregamento real das imagens e dos metadados de áudio e
vídeo (quando ativo), tutorial e lembrete, navegação, catálogo e mosaico, modais, foco, PIN, controle de som, mensagens
de erro e os prazos de 105/120 segundos. O relógio e a reprodução
de mídia são simulados para tornar os testes rápidos e independentes de codecs e
autoplay. Eles não verificam a qualidade ou a audibilidade das gravações.

Antes de instalar no painel, confira manualmente imagem e som de cada animal,
mute/repetição, inatividade e funcionamento sem internet. Quando reativar o vídeo,
confira também sua reprodução real e a navegação do percurso completo.
Valide também 4K horizontal, resoluções menores e toque no equipamento real.

## Começar a manutenção

1. Leia `index.html` para localizar a tela ou o modal envolvido.
2. Leia `iniciarAplicacao()` e `mudarTela()` em `js/main.js` para entender o fluxo.
3. Siga a tabela acima até o arquivo responsável pela mudança. Textos e mídias
   ficam em configuração e catálogo; comportamento fica nos demais scripts.
4. Execute a regressão e valide manualmente o fluxo afetado.

Para adicionar uma funcionalidade, prefira uma função no arquivo responsável.
Cadastre eventos com `addEventListener` e use `textContent` para conteúdo dinâmico.
Crie outro arquivo apenas quando houver uma responsabilidade distinta que o
justifique. Mantenha caminhos relativos e recursos locais.

O [tutorial de alterações](TUTORIAL-DE-ALTERACOES.md) explica campos do catálogo,
falas, tempos, mídias, versão e cuidados com o mosaico.

## Pendências de conteúdo e instalação

Todos os caminhos de mídia atualmente referenciados existem no repositório.
Existem também imagens e sons de animais fora do catálogo e originais não usados;
esses arquivos foram preservados.

Fontes, créditos, licenças e conteúdo científico ainda precisam de revisão humana.
O gato-mourisco possui `teste` em `creditoImagem`; os demais créditos estão vazios.
Não invente atribuições. A fonte do gato-mourisco foi substituída por referência do
ICMBio. Todos os animais têm os destaques `🐾 Grupo`, `🍽️ Alimentação` e `🕒 Hábito`,
com referências para os dados completados ou corrigidos. As descrições foram
preservadas; a jaguatirica mantém a descrição anterior ao documento dos demais animais.

O histórico de alterações está no Git (`git log`). Não há arquivo de changelog,
build, lint ou CI configurados.
