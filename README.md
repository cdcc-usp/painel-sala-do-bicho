# Painel Interativo — Fauna

Versão: **1.0.0**

Aplicação web offline para um painel touchscreen do CDCC.

Dante, o lobo-guará mascote, se apresenta e convida o visitante a conhecer os
animais. Depois do vídeo, Dante pergunta se o visitante já conhece alguns deles
e orienta a tocar nas imagens. O botão dessa fala abre a galeria e seus sons.
Ao terminar o vídeo, essa última fala abre automaticamente; pausar mantém a tela do vídeo.

## Recursos implementados

- apresentação do Dante em três etapas;
- galeria com 18 animais, em mosaico que ocupa a janela no painel horizontal;
- informações, curiosidades e som em cada animal;
- reprodução de vídeo em uma tela anterior à galeria;
- controle global para ligar e desligar o som;
- botão para voltar ao início;
- aviso e reinício automático por inatividade;
- pausa do reinício com senha do mediador e teclado na tela;
- funcionamento sem internet;
- versão visível no rodapé e registrada no código;
- substitutos visuais quando uma imagem ainda não foi adicionada.

## Como executar

Para um teste rápido, abra `index.html` no Microsoft Edge, Chrome ou Firefox.

Para testar por um servidor local, execute na pasta do projeto:

```bash
python -m http.server 8080
```

Depois abra `http://localhost:8080`.

## Arquivos principais

- `index.html`: estrutura das telas e dos modais.
- `css/style.css`: aparência e adaptação a diferentes telas.
- `js/config.js`: versão, textos do Dante, tempos e caminhos do vídeo.
- `js/dados.js`: conteúdo dos animais.
- `js/main.js`: navegação, áudio, vídeo e inatividade.
- `TUTORIAL-DE-ALTERACOES.md`: instruções completas de manutenção.
- `CHANGELOG.md`: histórico das versões.

## Antes de instalar no painel

Adicione as imagens, os áudios, a imagem final do Dante e o vídeo nos caminhos
indicados em `TUTORIAL-DE-ALTERACOES.md`. Revise também o conteúdo científico e
teste a experiência na resolução e orientação reais do monitor.
