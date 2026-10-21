# Tutorial de alterações e funcionamento técnico

Este projeto foi preparado para ser alterado sem ferramentas de compilação,
gerenciador de pacotes ou conexão com a internet.

## 1. Alterar as falas do Dante

Abra `js/config.js` e procure por `dante.etapas`. Cada item representa uma fala:

```js
{
    rotulo: 'BOAS-VINDAS',
    fala: 'Texto principal do balão.',
    complemento: 'Texto menor de apoio.'
}
```

É possível alterar os textos ou acrescentar novas etapas copiando esse formato.
O indicador de progresso é criado automaticamente.
As falas avançam ao tocar em qualquer lugar da tela, com uma indicação de toque
e seta abaixo do balão. Não há botões de conversa. Enter e Espaço também avançam;
os controles Início e Som mantêm suas próprias ações.
O campo `rotulo` é opcional; sem ele, sua linha fica oculta e não reserva espaço.
No lançamento sem vídeo, aparecem as boas-vindas, o convite, o toque guiado e a
orientação sobre o X. Dante fala sobre o mosaico escurecido nas três primeiras
etapas. O toque guiado usa `interativa: true` e libera apenas o card iluminado,
sem botão para pular. Tocar nele abre o animal com som e a última fala do Dante,
marcada com `aoAbrirAnimal: true`, sobreposta à frente do painel de informações.
Dante e o balão usam o mesmo estilo das etapas anteriores, sem alterar tamanho
ou posição da janela do animal, mantendo o X livre. O X fica destacado
com “Fechar e explorar”. Um toque dispensa a orientação, mantendo a ficha aberta;
o X fecha a ficha. A orientação não se repete nos demais animais. Início e reinício
por inatividade restauram todo o tutorial.
O destaque amarelo dos cards desaparece; o foco de teclado continua visível em branco.
A fala intermediária permanece no array com `somenteComVideo: true` e só aparece
quando `CONFIG.video.ativo` for `true`. Os indicadores mostram somente as falas
ativas. O convite mantém `aposVideo: true`: esse marcador identifica a fala
após o vídeo quando ele estiver ativo. Preserve-o em uma única etapa.

O alvo e a demora até o contorno pulsar ficam em `CONFIG.tutorial`:

```js
tutorial: {
    animalId: 'gato-mourisco',
    tempoDestaqueMs: 8000
},
```

O alvo padrão é o primeiro card, visível também em telas menores. Ao trocar o
animal, confira se ele permanece visível e livre do balão em todas as resoluções.
O lembrete é cancelado ao concluir ou reiniciar. A preferência do sistema
por movimento reduzido desativa a pulsação contínua.

## 2. Adicionar a imagem do Dante

Coloque a imagem em:

```text
assets/dante/dante.png
```

Prefira PNG ou WebP com fundo transparente e boa resolução. O personagem é
dimensionado automaticamente. Enquanto o arquivo não existir, aparecerá um
substituto com emoji.

Se quiser usar outro nome ou formato, altere `CONFIG.dante.imagem` em
`js/config.js`.

## 3. Alterar o tempo de inatividade

Em `js/config.js`:

```js
tempoInatividadeMs: 120000,
tempoAvisoMs: 15000,
```

Os valores estão em milissegundos:

- `120000` = 2 minutos até o reinício;
- `15000` = aviso nos últimos 15 segundos (aparece após 1 minuto e 45 segundos).

O temporizador funciona somente na galeria e é renovado a cada `pointerdown` ou
`keydown`, inclusive dentro dos modais de animal e PIN. Quando o aviso aparece,
o botão “Continuar explorando” ou Escape inicia um novo prazo. Apresentação e
vídeo não têm reinício por inatividade. Ao reiniciar, a aplicação fecha os modais,
para as mídias, retorna à primeira fala do Dante e restaura o estado inicial do som.
Voltar à aba ou recuperar o foco da janela apenas confere o prazo existente,
sem renová-lo. Se os callbacks ficaram suspensos em segundo plano e o prazo
venceu, a retomada ou o primeiro toque restaura imediatamente as boas-vindas.

Na galeria, o botão “Pausar reinício” permite que o mediador mantenha a experiência
aberta durante uma atividade. Digite o PIN de quatro dígitos usando o teclado
numérico na tela ou um teclado físico e confirme. PIN incorreto não pausa o
reinício. É possível mostrar/ocultar o PIN, apagar dígitos, limpar ou cancelar.

O PIN é configurado em `CONFIG.senhaMediacao`, em `js/config.js`. Use uma string
com quatro dígitos. É um controle
local da interface, sem autenticação remota. A pausa não é gravada: continua ao
abrir e fechar animais, mas termina ao voltar ao Início ou recarregar a página. Clique em
“Reinício pausado · Reativar” para restaurar imediatamente o prazo completo de
inatividade. Esse retorno ao modo automático não pede senha.

## 4. Reativar ou alterar o vídeo

O lançamento atual usa `CONFIG.video.ativo: false`. Nesse modo, o vídeo não é
carregado nem exibido e a fala com `somenteComVideo: true` fica fora do fluxo.
O botão Início retorna às boas-vindas; a galeria não tem seta de retorno.

Quando o vídeo final estiver pronto:

1. Coloque o arquivo no caminho configurado abaixo, ou atualize `video.arquivo`.
2. Altere `ativo: false` para `ativo: true` dentro de `video` em `js/config.js`.
3. Recarregue a página. A fala intermediária e o vídeo voltam ao fluxo juntos.
4. Execute a regressão e confira reprodução real, setas e botão Início.

Coloque o vídeo neste caminho:

```text
assets/videos/fauna.mp4
```

Para maior compatibilidade, use MP4 com vídeo H.264 e áudio AAC. Se o nome
for diferente, altere `video.arquivo` em `js/config.js`.

Com o vídeo ativo, ele vem depois das duas primeiras falas do Dante. Ao terminar, abre
automaticamente a terceira fala, que orienta a tocar nos animais. Enquanto
estiver pausado, permanece na tela do vídeo. A seta permite avançar manualmente
para a mesma fala. Um toque na tela abre o toque guiado; a seta dessa fala permite rever o vídeo.

Todo o conteúdo deve ser local. Não use links do YouTube ou arquivos hospedados
em sites externos, pois o painel precisa continuar funcionando sem internet.

## 5. Alterar um animal

Abra `js/dados.js`. Cada animal possui este formato:

```js
{
    id: 'nome-sem-acentos',
    nome: 'Nome Popular',
    img: 'assets/animais/nome-sem-acentos/imagem.jpg',
    // imgModal: 'assets/animais/nome-sem-acentos/imagem-modal.jpg', // opcional
    audio: 'assets/animais/nome-sem-acentos/audio.mp3',
    cientifico: 'Nome científico',
    destaques: ['🐾 Grupo: Mamífero', '🍽️ Alimentação: Onívora', '🕒 Hábito: Noturno'],
    classeTamanho: '',
    descricao: 'Primeiro parágrafo.\nSegundo parágrafo.',
    fonte: 'Endereço da fonte consultada',
    creditoImagem: ''
}
```

Crie a pasta do animal dentro de `assets/animais`, coloque a imagem e o áudio
nela e confira se os caminhos estão iguais aos registrados em `dados.js`.
Use o nome e a extensão reais do arquivo; há imagens JPG e PNG no catálogo.
`imgModal` é opcional: sem ele, o modal usa `img`. Quebras `\n` em `descricao`
viram parágrafos. Mantenha exatamente três destaques, nesta ordem e com os mesmos
emojis: `🐾 Grupo`, `🍽️ Alimentação` e `🕒 Hábito`. Use grupos no mesmo nível:
mamífero, ave, réptil, anfíbio ou inseto. A alimentação concorda com o rótulo
(carnívora, herbívora etc.); hábito indica o período de atividade (diurno,
noturno, crepuscular ou uma combinação). Consulte fontes antes de preencher ou
alterar esses dados; não complete por suposição. Múltiplas fontes podem ficar
em `fonte`, separadas por ` | `.

As fontes são apresentadas somente como texto. Isso evita que o visitante abra
um navegador externo e saia do quiosque.

Preencha `creditoImagem` com o nome do fotógrafo, instituição e/ou licença da
foto, conforme as informações da mídia. Esse crédito aparece junto da fonte
no painel de informações do animal. Se ficar vazio, a linha não é exibida.
Quando houver `imgModal`, informe o crédito dessa foto. Não invente atribuições.

O painel de informações usa a variável CSS `--escala-animal`, baseada na altura
da janela, para manter uma proporção semelhante em HD e 4K. O cabeçalho mostra
a foto ao lado do nome e destaques, e o texto fica abaixo. A foto usa sua proporção
natural, sem faixas laterais. Em telas estreitas, o cabeçalho fica vertical.
O conteúdo tem rolagem interna quando ultrapassa a altura disponível.

### Ordem e posicionamento dos cards

Acima de 1100px, os 18 primeiros cards têm posições explícitas definidas pelos
seletores `.card:nth-child(...)` em `css/style.css`. A ordem do array `animais`
determina qual animal ocupa cada espaço. O mosaico usa seis colunas e seis linhas.
O recorte específico do tamanduá fica em `#card-tamandua .imagem-card`.

Até 1100px, os cards têm tamanhos uniformes, com três colunas; em telas menores,
passam a duas colunas e a galeria permite rolagem. `classeTamanho` continua aceito
e é copiado para a classe do card, mas não determina o tamanho em nenhum dos
layouts atuais. As regras antigas de tamanho eram anuladas por `nth-child` e
foram retiradas; o campo foi mantido para preservar o formato do catálogo.

## 6. Adicionar um animal

1. Copie um objeto completo dentro da lista `animais`.
2. Altere todos os seus dados.
3. Escolha um `id` único, sem espaços ou acentos.
4. Crie a pasta da mídia em `assets/animais`.
5. Recarregue a página. O card será criado automaticamente.

O card é criado sem alterar HTML ou JavaScript de comportamento. Entretanto,
adicionar além dos 18 animais exige planejar o espaço no mosaico e ajustar o CSS
para a tela horizontal; não basta acrescentar o registro. Confira o posicionamento
de todos os cards nas resoluções grandes e pequenas.

## 7. Remover um animal

Apague somente o objeto correspondente em `js/dados.js`. Confira as vírgulas:
todos os objetos, exceto o último, devem terminar com vírgula.
Como a posição depende da ordem, remover ou reordenar registros também exige
conferir o mosaico e ajustar seus seletores quando necessário. Preserve as mídias
até confirmar que podem ser removidas.

## 8. Controle de som

O botão “Som ligado/desligado” controla tanto os sons dos animais quanto o
vídeo. O som começa ligado porque a audição dos animais faz parte da experiência.

Para começar mudo, altere em `js/config.js`:

```js
somInicialmenteAtivo: false
```

## 9. Alterar a versão

Altere apenas esta linha em `js/config.js`:

```js
versao: '1.0.0'
```

Use, por exemplo:

- `1.0.1` para uma pequena correção;
- `1.1.0` para uma funcionalidade nova;
- `2.0.0` para uma mudança incompatível ou reformulação ampla.

Descreva a mudança no commit do Git. Atualmente não existe `CHANGELOG.md`.

## 10. Como a aplicação funciona internamente

`index.html` possui três telas: apresentação, vídeo e galeria. O vídeo fica oculto
e sem fonte carregada enquanto `CONFIG.video.ativo` for `false`. Somente uma tela
recebe a classe CSS `ativa` por vez. `etapasDante`, em `main.js`, contém apenas as
falas que participam do percurso atual, filtradas a partir da configuração.
Durante o tutorial, a classe `fundo-tutorial` mostra a galeria sob o Dante sem
ativar a inatividade. `inert` bloqueia o mosaico nas falas e os cards sem destaque
na etapa interativa. Ao concluir, a galeria passa a ser a tela ativa.

Comece por `iniciarAplicacao()` em `js/main.js`. Ela mapeia os elementos com ID,
cadastra os eventos e prepara a interface. O objeto `estado` reúne somente os
valores compartilhados entre funcionalidades. Não há persistência entre recargas.

- `main.js`: inicialização, eventos globais, etapas do Dante, `mudarTela()` e
  `reiniciarExperiencia()`.
- `galeria.js`: `gerarCards()`, `abrirAnimal()` e `fecharAnimal()`.
- `midias.js`: preparação das imagens, áudio, vídeo, mensagens de falha e mute.
- `mediacao.js`: teclado/PIN, pausa, aviso e prazos de reinício automático.
- `modais.js`: animações, cancelamento de fechamentos pendentes e foco.
- `tutorial.js`: sobreposição, card iluminado, lembrete de toque e foco da ajuda.

São scripts clássicos. Preserve a ordem do HTML: `config.js` → `dados.js` →
`modais.js` → `midias.js` → `galeria.js` → `mediacao.js` → `tutorial.js` → `main.js`.
As funções dos arquivos de comportamento só acessam `estado` e `elementos`
depois da inicialização. Não adicione `async` aos scripts nem os converta
individualmente em módulos, pois isso muda o escopo e a execução por `file://`.

Os eventos usam `addEventListener`; textos dinâmicos usam `textContent` e criação
de elementos. Para um novo controle, adicione um ID ao HTML e registre seu evento
no arquivo responsável. `mapearElementos()` coleta os IDs automaticamente.

Os modais utilizam o atributo `hidden` quando fechados e a classe `ativo` durante
a animação de abertura. O vídeo usa um player com controles em sua própria tela.
O fechamento demora 220ms, em acordo com a transição CSS. Reabrir cancela esse
fechamento. O foco fica no modal superior e volta ao controle de origem ao fechar;
o fundo recebe `inert` enquanto houver um modal aberto. O aviso pode aparecer
acima do animal; continuar preserva as informações abertas. O aviso fecha e limpa
o teclado de PIN quando ele está aberto.

Em telas acima de 1100px, a galeria usa seis linhas flexíveis, com margem acima
para os controles e mantém as margens laterais do mosaico. O vídeo centralizado preenche
sua área sem distorção. Setas grandes ficam no centro vertical das bordas.
Título não reserva espaço no mosaico; rodapé fica oculto durante o tutorial. Em telas
menores, a galeria possui rolagem. Os espaçamentos estão em variáveis CSS em `:root`.

Para adicionar uma funcionalidade, escolha o arquivo pela responsabilidade,
crie funções pequenas e conecte seus eventos na inicialização. Evite duplicar
estado derivável da tela atual. Acrescente uma verificação de comportamento em
`testes/regressao.js` quando a mudança afetar os fluxos principais. Consulte os
comandos de execução e limitações dos testes no README.

## 11. Instalar no Windows 11 em modo quiosque

1. Copie a pasta completa para um local fixo, por exemplo `C:\PainelFauna`.
2. Teste `index.html` no Microsoft Edge.
3. Configure o Acesso Atribuído do Windows ou um atalho de inicialização do Edge
   em modo quiosque.
4. Aponte o navegador para `file:///C:/PainelFauna/index.html`.
5. Desative suspensão de tela, notificações e atualizações automáticas durante o
   horário da exposição, conforme as regras de administração da instituição.
6. Reinicie o computador e teste tudo sem conexão com a internet.

Em instalações permanentes, peça ao responsável de TI para configurar uma conta
local restrita, inicialização automática e recuperação após queda de energia.

## 12. Checklist antes da publicação

- [ ] Dante definitivo foi adicionado.
- [ ] Todas as imagens aparecem.
- [ ] Todos os sons funcionam e têm volume semelhante.
- [ ] Sem vídeo: boas-vindas → convite → toque guiado → orientação sobre o X → galeria; Início volta às boas-vindas e a galeria não tem seta de retorno.
- [ ] As falas avançam por toque na tela, com indicação visual e sem botões de conversa; tocar nos controles globais não avança.
- [ ] O toque no card iluminado é obrigatório e abre com som; o destaque pulsa após 8s e não reaparece ao fechar pelo X.
- [ ] A primeira janela mostra Dante orientando sobre o X; fechar encerra a orientação, que não se repete nos demais animais.
- [ ] Quando reativado: o vídeo é local e abre a terceira fala do Dante ao terminar; um toque na tela abre o toque guiado.
- [ ] Textos e nomes científicos foram revisados por especialista.
- [ ] Fontes e licenças das mídias foram registradas.
- [ ] Botões foram testados no touchscreen real.
- [ ] A página foi testada sem internet.
- [ ] O reinício por inatividade foi testado.
- [ ] Senha incorreta, pausa, reativação e retorno ao Início foram testados.
- [ ] A regressão passou (`python3 testes/executar.py`); a reprodução real foi conferida manualmente.
- [ ] A versão foi atualizada quando pertinente e a mudança foi registrada no Git.
