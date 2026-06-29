# 🌲 Painel Interativo - Sons da Natureza

Este é um projeto de totem/painel interativo desenvolvido em web clássica (HTML, CSS e JavaScript puros). Ele foi projetado para rodar de forma nativa e offline em qualquer dispositivo, permitindo que usuários cliquem em animais para abrir informativos dinâmicos e reproduzir seus respectivos sons naturais.


## 🎨 1. Sons e Imagens dos Animais (Para Editores)

Para substituir as mídias de qualquer animal, navegue até a pasta `assets/` e entre na pasta correspondente ao ID do animal desejado. 

> ⚠️ **REGRA CRUCIAL:** Ao substituir arquivos, mantenha obrigatoriamente os nomes exatos e as extensões em letras minúsculas: **`imagem.jpg`** e **`audio.mp3`**.

Como o painel utiliza um design de grade assimétrica, cada tipo de card exige uma proporção de imagem específica para que o corte automático (`object-fit: cover`) não remova partes importantes do animal:

| Tipo de Card | Animais Correspondentes | Dimensão Ideal (Pixels) | Proporção / Formato Visual |
| :--- | :--- | :--- | :--- |
| **1. Tamanho Largo** | Seriema, Onça-Parda | **1200 x 330** | `3.7:1` (Panorâmico horizontal extremo) |
| **2. Tamanho Alto** | Lobo-Guará, Ema, Coruja | **600 x 720** | `1:1.2` (Vertical / Retrato) |
| **3. Tamanho Gigante** | Onça-Pintada | **1200 x 700** | `16:9` aprox. (Widescreen de destaque) |
| **4. Tamanho Padrão** | Todos os outros 10 animais | **800 x 450** | `16:9` (Horizontal Padrão / Leve) |

💡 **Dica de Ouro:** Ao escolher novas fotos, certifique-se de que o corpo ou o focinho do animal esteja **exatamente no centro da imagem**. Isso garante que o corte automático do sistema seja simétrico e não "degole" o bicho na tela.


## 📝 2. Alterando os Textos (Para Editores)

Todas as informações textuais exibidas nos popups estão isoladas no arquivo `dados/dados.js`. Você pode abri-lo com qualquer editor de texto simples (como o Bloco de Notas).

Cada animal possui a seguinte estrutura de edição:
```javascript
{ 
    id: 'lobo-guara', 
    nome: 'Lobo-Guará', 
    img: 'assets/lobo-guara/imagem.jpg', 
    audio: 'assets/lobo-guara/audio.mp3',
    cientifico: 'Chrysocyon brachyurus',
    destaques: ['⚖️ 20 a 30 kg', '🍽️ Onívoro', '🍅 40% da dieta é a fruta-do-lobo'],
    classeTamanho: 'tamanho-alto',
    descricao: 'Linha 1 do texto...\nLinha 2 do texto...',
    fonte: 'https://...'
}
```

🛑 Atenção ao Editar:

    Aspas: O texto deve sempre estar entre aspas simples ('texto'). Se você esquecer de abrir ou fechar uma aspa, ou apagar uma vírgula no final da linha, o painel inteiro vai parar de funcionar.

    Tags de Destaque: O campo destaques aceita uma lista de frases curtas. Você pode colocar quantas quiser (recomenda-se até 4) e pode usar emojis para ilustrar.

    Quebra de Linhas: Para criar um novo parágrafo dentro da descrição, utilize o caractere \n exatamente onde deseja que o texto quebre.

## 💻 3. Questões Técnicas (Para Desenvolvedores)

Esta seção detalha a arquitetura técnica adotada para garantir performance, resiliência offline e facilidade de manutenção do ecossistema.
📐 Arquitetura do Projeto

O projeto foi deliberadamente construído utilizando Vanilla Architecture (HTML5, CSS3 e EcmaScript 6+) sem intermediadores de build, empacotadores (Webpack/Vite) ou frameworks (React/Vue).

Estrutura:


📁 Projeto/\
├── 📄 index.html      --> Estrutura do DOM e pontos de montagem\
├── 📁 css/ \
│   └── 📄 style.css   --> Variáveis nativas, CSS Grid e animações \
├── 📁 js/\
│   └── 📄 main.js     --> Engine de renderização e Event Handlers\
└── 📁 dados/ \
│   └── 📄 dados.js    --> Estado de dados estático (Mock Database)