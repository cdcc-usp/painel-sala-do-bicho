# Contexto do projeto

Painel educativo offline de fauna para touchscreen do CDCC, com o mascote Dante,
vídeo e galeria de animais com informações e sons. Versão em `CONFIG.versao`.

## Tecnologias e arquitetura

- HTML, CSS e JavaScript puro; sem framework, backend, dependências de pacotes
  ou etapa de compilação.
- `index.html`: telas Dante, vídeo e galeria; controles globais e modais.
- `js/config.js`: `CONFIG`, com falas do Dante, caminhos das mídias, versão,
  parâmetros de som e tempos em milissegundos. `Object.freeze` é superficial.
- `js/dados.js`: array `animais`, contendo `id`, `nome`, `img`, `audio`,
  `cientifico`, `destaques`, `classeTamanho`, `descricao`, `fonte`, `creditoImagem`
  e `imgModal` opcional. Quebras `\n` na descrição viram parágrafos.
- `js/main.js`: estado em memória, inicialização em `DOMContentLoaded`, eventos,
  navegação, geração dos cards, modais, mídias e inatividade.
- `css/style.css`: variáveis de tema, CSS Grid, animações e media queries.
- `assets/animais/<id>/`, `assets/dante/` e `assets/videos/`: mídias locais.
- Scripts clássicos compartilham o escopo global: preservar a ordem
  `config.js` → `dados.js` → `main.js`. Não há módulos ES, classes ou serviços.
- Não há banco de dados, persistência de sessão ou chamadas a APIs externas.
  URLs de fontes são exibidas como texto, sem navegação externa.

## Fluxos e requisitos confirmados

- Painel final: tela 4K horizontal; navegador ainda sem escolha específica.
  Usado em mediações espontâneas e agendadas do CDCC.
- Fluxo: três etapas do Dante → vídeo → galeria. O fim do vídeo e a seta de
  avanço abrem a galeria; voltar ao vídeo reinicia a reprodução.
- A apresentação dimensiona Dante, balão, textos, botão e progresso conforme a
  janela, sem os antigos limites de 1320px/740px. O balão tem proporção próxima
  de um quadrado e largura limitada pela altura da janela. Botão e indicadores
  ficam fora do balão, abaixo dele, em `.controles-dante`; `.apresentacao-dante`
  agrupa fala e controles. Em telas estreitas, o layout é vertical.
- O evento `ended` avança automaticamente; pausar o vídeo mantém sua tela.
  A galeria não possui seção de vídeo nem modal de vídeo residual.
- Em telas acima de 1100px, o mosaico ocupa o espaço disponível, com seis linhas
  flexíveis, margem superior para Início/Som e margens laterais para as setas.
  Setas grandes ficam no centro vertical das bordas, com área de toque ampliada.
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
  Fonte e crédito da imagem ficam juntos no rodapé do conteúdo. `creditoImagem`
  está vazio nos 18 registros para preenchimento posterior e só aparece quando
  informado; creditar a foto exibida no modal (`imgModal`, quando existir).
- Inatividade é monitorada apenas na galeria, por `pointerdown` e `keydown`.
  Reinício após 120000ms sem interação; aviso nos últimos 15000ms (começa em
  105000ms). Vídeo e apresentação não têm reinício por inatividade.
- Na galeria, “Pausar reinício” abre um teclado numérico de três colunas com
  zero centralizado na última linha, sem depender do teclado do sistema.
  O PIN tem quatro dígitos e está em `CONFIG.senhaMediacao`;
  o teclado físico também funciona. O controle é local, sem autenticação remota.
  Apenas a senha correta pausa os temporizadores. A pausa dura na sessão atual,
  inclusive ao rever o vídeo; reativar pelo botão inicia um prazo completo.
  Voltar ao Início ou recarregar a página restaura o reinício automático.
- Reiniciar fecha modais, limpa a senha digitada, para mídias e volta ao Dante,
  restaurando o som conforme a configuração. O aviso de inatividade fecha o
  teclado se ele estiver aberto; abrir o teclado não desativa a inatividade.
- A composição atual do catálogo segue o mosaico fornecido pelo usuário.
  Vídeo, mídias faltantes e créditos ainda serão definidos
  ou fornecidos pelo usuário; não preencher por suposição.

## Convenções e cuidados

- Manter a separação entre configuração, conteúdo, comportamento e aparência.
- Seguir o estilo existente: quatro espaços, nomes em português, `camelCase`
  no JavaScript, IDs/classes com hífens, strings geralmente com aspas simples.
- Usar IDs de animais únicos, minúsculos, sem espaços ou acentos.
- Preservar `addEventListener`, `textContent` e criação de elementos para os
  textos dinâmicos. IDs do HTML devem acompanhar `mapearElementos()` e eventos.
- Preservar os estados CSS `ativa`, `ativo`, `hidden`, `oculto` e `modal-aberto`.
  O fechamento de modal usa 220ms no JS, correspondente à transição CSS.
- Manter caminhos relativos e mídias locais: deve funcionar offline e ao abrir
  `index.html` diretamente. Preservar substitutos de imagens e mensagens de erro.
- Conferir ordem, quantidade e posicionamento dos cards ao alterar o catálogo.
  Nas telas menores, `.card:nth-child(n)` tem maior especificidade que as classes
  de tamanho e atualmente anula seus spans; considerar isso ao modificar o CSS.
- Preservar alterações locais preexistentes e limitar mudanças ao pedido atual.

## Execução e validação

Abrir `index.html` em um navegador ou executar, na raiz:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Acessar `http://127.0.0.1:8080`. Não há comandos de build, lint, testes
automatizados ou CI configurados. Validar manualmente os fluxos afetados:
apresentação, vídeo/setas, galeria, modais, áudio/repetição/mute, botão Início,
inatividade e erros de mídia. Conferir console, funcionamento offline, layout
4K horizontal, resoluções menores e touchscreen real quando disponível.

## Pendências identificadas

- O catálogo tem 18 registros, ordenados conforme o mosaico de referência:
  gato-mourisco, gafanhoto, cascavel, tamanduá, lobo-guará, sauá, sapo-cururu,
  jaguatirica, seriema, tatu-galinha, raposa-do-campo, anta, coruja, bugio,
  onça-pintada, pica-pau, jacaré e onça-parda.
- Textos de 17 animais foram atualizados com o documento fornecido pelo usuário;
  o jacaré agora é Jacaré-de-Papo-Amarelo (`Caiman latirostris`). A jaguatirica
  mantém o texto anterior, pois não constava no documento. Urutu, ema, tico-tico
  e rã-touro ficam para depois, conforme confirmado pelo usuário.
- Os destaques novos usam Grupo, Alimentação e Periodicidade; campos vazios
  no documento são omitidos. Múltiplas fontes ficam no campo `fonte`, separadas
  por ` | `. Não completar ou revisar conteúdo científico por suposição.
- Pastas com `.gitkeep` estão preparadas para imagem e áudio de tamanduá,
  jaguatirica, raposa-do-campo, anta e jacaré. O vídeo local está em
  `assets/videos/fauna.mp4`; não há mais capa de vídeo na galeria.
- Há mídias não referenciadas, inclusive de ema, tico-tico e urutu. Não removê-las
  automaticamente. `tico-tico/imagem.jpg` contém uma imagem WebP.
- O modal de senha contém o foco e o devolve ao controle ao fechar. Os demais
  modais têm atributos ARIA, mas não gerenciamento de foco completo.
- `README.md`, `TUTORIAL-DE-ALTERACOES.md` e `assets/LEIA-ME.txt` têm divergências
  em relação ao código. `CHANGELOG.md` é citado, mas não existe. Conferir o código
  antes de seguir exemplos e atualizar documentação quando pertinente ao pedido.
