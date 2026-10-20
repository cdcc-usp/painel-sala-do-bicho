# Contexto do projeto

Painel educativo offline de fauna para touchscreen do CDCC, com o mascote Dante,
vídeo e galeria de animais com informações e sons. Versão em `CONFIG.versao`.

## Tecnologias e arquitetura

- HTML, CSS e JavaScript puro; sem framework, backend, dependências de pacotes
  ou etapa de compilação.
- `index.html`: telas Dante, vídeo e galeria; controles globais e modais.
- `js/config.js`: `CONFIG`, com falas do Dante, caminhos das mídias, versão,
  parâmetros de som e tempos em milissegundos. `video.ativo` está `false` para o
  lançamento sem vídeo. `Object.freeze` é superficial.
- `js/dados.js`: array `animais`, contendo `id`, `nome`, `img`, `audio`,
  `cientifico`, `destaques`, `classeTamanho`, `descricao`, `fonte`, `creditoImagem`
  e `imgModal` opcional. Quebras `\n` na descrição viram parágrafos.
- `js/main.js`: estado compartilhado em `estado`, mapeamento de IDs em `elementos`,
  inicialização em `DOMContentLoaded`, eventos globais, navegação e reinício.
- `js/galeria.js`: cards e conteúdo do modal de animal.
- `js/midias.js`: imagens/substitutos, áudio, vídeo, erros e controle global de som.
- `js/mediacao.js`: teclado/PIN, pausa e prazos de inatividade.
- `js/modais.js`: ciclo de abertura/fechamento, cancelamento de fechamentos pendentes
  e gerenciamento do foco; fundo e modais sobrepostos recebem `inert`.
- `js/tutorial.js`: sobreposição do Dante, card iluminado, lembrete e foco da ajuda.
- `css/style.css`: variáveis de tema, CSS Grid, animações e media queries.
- `assets/animais/<id>/`, `assets/dante/` e `assets/videos/`: mídias locais.
- Scripts clássicos compartilham o escopo global: preservar a ordem
  `config.js` → `dados.js` → `modais.js` → `midias.js` → `galeria.js` →
  `mediacao.js` → `tutorial.js` → `main.js`. Não há módulos ES, classes ou serviços na aplicação.
- Não há banco de dados, persistência de sessão ou chamadas a APIs externas.
  URLs de fontes são exibidas como texto, sem navegação externa.

## Fluxos e requisitos confirmados

- Painel final: tela 4K horizontal; navegador ainda sem escolha específica.
  Usado em mediações espontâneas e agendadas do CDCC.
- Fluxo atual: boas-vindas do Dante → convite para conhecer os animais da região →
  toque guiado em um card → orientação sobre o X na primeira janela → galeria.
  A etapa intermediária tem `somenteComVideo: true` e fica fora do fluxo
  enquanto `CONFIG.video.ativo` for `false`. `etapasDante`, em `main.js`, contém
  apenas as falas ativas e determina o progresso. O vídeo fica oculto, sem carregar
  sua fonte ou reproduzir. A galeria não tem seta de retorno; o convite mantém
  `aposVideo: true` para o percurso com vídeo. A seta para rever o vídeo fica oculta.
  Início restaura as
  boas-vindas, o progresso e o estado da sessão.
- Para retomar o vídeo e a etapa intermediária, basta configurar `video.ativo: true`
  e recarregar. O percurso volta a ser: boas-vindas → fala intermediária → vídeo →
  orientações → toque guiado → orientação sobre o X → galeria. O fim do vídeo e sua seta de avanço abrem a fala marcada
  com `aposVideo: true`; a seta nessa fala reinicia o vídeo. A implementação e a
  mídia foram preservadas para essa retomada.
- Dante e seu balão aparecem sobre o mosaico escurecido, na parte inferior da
  janela, como um tutorial de jogo. As falas existentes foram preservadas e a
  etapa de toque tem `interativa: true`. `CONFIG.tutorial.animalId` define o card
  iluminado (gato-mourisco); após `tempoDestaqueMs: 8000`, o contorno pulsa.
  Tocar no card é obrigatório para abrir o animal com som;
  não há botão para pular. Ao fechar pelo X, o amarelo não reaparece: hover e
  foco comuns usam branco. Reiniciar cancela o lembrete e restaura as boas-vindas.
  A galeria usa `fundo-tutorial` enquanto Dante está ativo; permanece sem a
  classe `ativa`, sem inatividade e com `inert` até a etapa interativa, quando
  apenas o card iluminado é liberado. Tab fica nos controles e nesse card.
  As falas avançam por toque em qualquer lugar da tela, com exceção do card
  obrigatório. Início, Som e a seta do vídeo mantêm suas próprias ações.
  Não há botões de conversa; `.aviso-avancar-dante` indica o toque com uma seta
  e fica oculto na etapa obrigatória. Enter e Espaço também avançam, sem repetição
  por tecla segurada. Balão, indicação e progresso dimensionam-se com a janela;
  em telas estreitas, Dante aparece acima do balão. Indicação e indicadores ficam
  em `.controles-dante`.
  Movimento reduzido desativa a pulsação contínua.
- A última fala usa `aoAbrirAnimal: true` em `CONFIG.dante.etapas` e aparece
  somente ao abrir o animal pelo toque guiado. Dante e seu balão flutuam à frente do
  painel de descrição, usando `.cenario-dante`, `.personagem-dante` e `.balao-dante`,
  no mesmo estilo das etapas anteriores. O guia é irmão de `.modal-animal-content`
  dentro do overlay, com posição fixa e camada acima do conteúdo. A orientação
  não altera dimensões, posição ou rolagem do painel e mantém o X livre. O X tem destaque
  e o texto “Fechar e explorar”, recebe foco e descreve a orientação com
  `aria-describedby`. Fechar remove a fala e o destaque; aberturas seguintes são
  normais. Um toque na orientação também a dispensa sem fechar a ficha; o toque
  usado para abrir o gato-mourisco não pode dispensá-la na mesma ação.
  Início/inatividade limpam a orientação e a restauram na nova sessão.
  O aviso de inatividade pode sobrepor essa etapa; continuar a preserva.
  `prepararImagemDante()` prepara a imagem e o substituto nas duas apresentações.
- O evento `ended` avança automaticamente; pausar o vídeo mantém sua tela.
  A galeria não possui seção de vídeo nem modal de vídeo residual.
- Em telas acima de 1100px, o mosaico ocupa o espaço disponível, com seis linhas
  flexíveis, margem superior para Início/Som e margens laterais preservadas.
  As setas do percurso com vídeo ficam no centro vertical das bordas, com área de toque ampliada.
  Usam SVGs simétricos centralizados nos círculos, com fundo branco e ícone verde escuro;
  evitar caracteres de fonte, cujo alinhamento visual varia entre navegadores.
  O vídeo centralizado preenche sua área, mantendo a proporção com `contain`.
  Espaçamentos compartilhados são variáveis CSS em `:root`. Título fica acessível
  sem ocupar espaço; rodapé fica oculto na galeria e no vídeo. `galeria-ativa` e
  `video-ativo` no body controlam rodapé/rolagem; telas menores mantêm a galeria
  com rolagem.
- Preservar a disposição atual do mosaico. Em telas acima de 1100px, os 18
  primeiros cards têm posições definidas por `nth-child`: a ordem do array
  determina a posição visual, independentemente de `classeTamanho`.
- O card do tamanduá usa `object-position: center 20%` no CSS para preservar
  cabeça e dorso no recorte horizontal, sem alterar a foto original.
- Abrir um animal preenche o modal e toca seu som. Fechar interrompe o áudio.
  “Ouvir novamente” reproduz o áudio e reativa o som global se necessário.
- O modal dos animais usa `--escala-animal`, baseada na altura da janela, para
  manter proporções semelhantes em HD e 4K, com dimensões mais compactas e rolagem
  interna quando necessário. O cabeçalho coloca foto ao lado de nome e destaques;
  descrição e áudio ficam abaixo. A imagem tem largura de 100% e altura automática,
  sem faixa lateral, corte ou distorção. Em telas estreitas, o cabeçalho é vertical.
  O X fica em um contêiner sem altura com `position: sticky` e permanece acessível
  ao rolar a descrição. A rolagem é zerada depois de abrir o modal, já visível.
  Fonte e crédito da imagem ficam juntos no rodapé do conteúdo. `creditoImagem`
  só aparece quando informado; creditar a foto exibida no modal (`imgModal`, quando
  existir). O gato-mourisco contém `teste` no crédito; os outros 17 créditos estão
  vazios. A fonte do gato-mourisco foi substituída por referência do ICMBio.
  Não preencher créditos por suposição.
- Inatividade é monitorada apenas na galeria, por `pointerdown` e `keydown`.
  Reinício após 120000ms sem interação; aviso nos últimos 15000ms (começa em
  105000ms). Vídeo e apresentação não têm reinício por inatividade.
  Voltar à aba/janela não renova o prazo: `verificarInatividade()` confere o
  horário ao retomar o foco/visibilidade e antes de registrar interação. Se os
  callbacks ficaram suspensos e o prazo venceu, retorna às boas-vindas completas.
- Na galeria, “Pausar reinício” abre um teclado numérico de três colunas com
  zero centralizado na última linha, sem depender do teclado do sistema.
  O PIN tem quatro dígitos e está em `CONFIG.senhaMediacao`;
  o teclado físico também funciona. O controle é local, sem autenticação remota.
  Apenas a senha correta pausa os temporizadores. A pausa dura na sessão atual,
  inclusive ao abrir e fechar animais; reativar pelo botão inicia um prazo completo.
  Voltar ao Início ou recarregar a página restaura o reinício automático.
- Reiniciar fecha modais, limpa a senha digitada, para mídias e volta ao Dante,
  restaurando o som conforme a configuração. O aviso de inatividade fecha o
  teclado se ele estiver aberto; abrir o teclado não desativa a inatividade.
- A composição atual do catálogo segue o mosaico fornecido pelo usuário.
  A seleção final das mídias e os créditos dependem do usuário;
  não preencher por suposição.

## Convenções e cuidados

- Manter a separação entre configuração, conteúdo, comportamento e aparência.
- Seguir o estilo existente: quatro espaços, nomes em português, `camelCase`
  no JavaScript, IDs/classes com hífens, strings geralmente com aspas simples.
- Usar IDs de animais únicos, minúsculos, sem espaços ou acentos.
- Preservar `addEventListener`, `textContent` e criação de elementos para os
  textos dinâmicos. `mapearElementos()` coleta automaticamente os IDs estáticos
  do HTML; os eventos devem usar esses mesmos IDs.
- Preservar os estados CSS `ativa`, `ativo`, `hidden`, `oculto` e `modal-aberto`.
  O fechamento de modal usa 220ms no JS, correspondente à transição CSS.
- Manter caminhos relativos e mídias locais: deve funcionar offline e ao abrir
  `index.html` diretamente. Preservar substitutos de imagens e mensagens de erro.
- Conferir ordem, quantidade e posicionamento dos cards ao alterar o catálogo.
  Nas telas menores, os cards têm tamanho uniforme. `classeTamanho` permanece no
  formato dos dados, mas não controla os layouts atuais. As regras de spans que
  eram anuladas por `.card:nth-child(n)` foram removidas.
- Preservar alterações locais preexistentes e limitar mudanças ao pedido atual.

## Execução e validação

Abrir `index.html` em um navegador ou executar, na raiz:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Acessar `http://127.0.0.1:8080`. Não há build, lint ou CI configurados.
A regressão automatizada usa Python 3 e Firefox, sem pacotes adicionais:

```bash
python3 testes/executar.py
python3 testes/executar.py --largura 3840 --altura 2160
python3 testes/executar.py --largura 1024 --altura 768
python3 testes/executar.py --largura 390 --altura 844
python3 testes/executar.py --interacoes
python3 testes/executar.py --com-video --interacoes
```

Por padrão abre `file://`; `--url http://127.0.0.1:8080` verifica um servidor local.
Relógio e reprodução de mídia são simulados na regressão. Validar manualmente os fluxos afetados:
apresentação, vídeo/setas, galeria, modais, áudio/repetição/mute, botão Início,
inatividade e erros de mídia. Conferir console, funcionamento offline, layout
4K horizontal, resoluções menores e touchscreen real quando disponível.
`--interacoes` acrescenta cliques e teclas WebDriver, reprodução real dos 18 áudios
e temporizadores reais com prazos menores em uma cópia temporária; `--com-video`
ativa o vídeo apenas em uma cópia temporária, sem combinar com `--url`.
O runner confere a área útil exata e usa um frame quando o Firefox limita a janela.

## Pendências identificadas

- O catálogo tem 18 registros, ordenados conforme o mosaico de referência:
  gato-mourisco, gafanhoto, cascavel, tamanduá, lobo-guará, sauá, sapo-cururu,
  jaguatirica, seriema, tatu-galinha, raposa-do-campo, anta, coruja, bugio,
  onça-pintada, pica-pau, jacaré e onça-parda.
- Textos de 17 animais foram atualizados com o documento fornecido pelo usuário;
  o jacaré agora é Jacaré-de-Papo-Amarelo (`Caiman latirostris`). A jaguatirica
  mantém o texto anterior, pois não constava no documento. Urutu, ema, tico-tico
  e rã-touro ficam para depois, conforme confirmado pelo usuário.
- Todos os animais têm três destaques, nesta ordem: `🐾 Grupo`, `🍽️ Alimentação`
  e `🕒 Hábito`. Grupo usa mamífero, ave, réptil, anfíbio ou inseto; alimentação
  fica no feminino e hábito indica o período de atividade. Os destaques foram
  padronizados e completados com referências; as descrições foram preservadas.
  Múltiplas fontes ficam no campo `fonte`, separadas por ` | `.
  Não completar ou revisar conteúdo científico por suposição.
- Todas as imagens e áudios referenciados atualmente existem. O vídeo local está em
  `assets/videos/fauna.mp4`, preservado mas desativado; não há capa de vídeo na galeria.
- Há mídias não referenciadas, inclusive de ema, tico-tico e urutu. Não removê-las
  automaticamente. `tico-tico/imagem.jpg` contém uma imagem WebP.
- Os três modais contêm o foco e o devolvem à origem ao fechar. O aviso de
  inatividade pode sobrepor o animal, preservando seu conteúdo ao continuar.
- `README.md`, `TUTORIAL-DE-ALTERACOES.md` e `assets/LEIA-ME.txt` descrevem a
  organização atual. Não existe `CHANGELOG.md`; o histórico está no Git.
