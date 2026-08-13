let audioAtual = null;

function gerarCards() {
    const container = document.getElementById('grid-animais');
    container.innerHTML = '';

    // A variável 'animais' vem direto do arquivo 'dados/dados.js' 
    animais.forEach((animal) => {
        const cardHTML = `
            <div class="card ${animal.classeTamanho}" id="card-${animal.id}" onclick="abrirModal('${animal.id}')">
                <img class="imagem-card" src="${animal.img}" alt="${animal.nome}"
                    onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><rect width=\\'100\\' height=\\'100\\' fill=\\'%232c3e50\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'white\\' font-size=\\'14\\'>Sem Foto</text></svg>'">
                <div class="nome-animal">${animal.nome}</div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function abrirModal(alvoId) {
    const animalData = animais.find(a => a.id === alvoId);
    if (!animalData) return;

    document.getElementById('modal-img').src = animalData.img;
    document.getElementById('modal-titulo').innerText = animalData.nome;
    document.getElementById('modal-cientifico').innerText = animalData.cientifico;
    
    const tagsContainer = document.getElementById('modal-tags-container');
    tagsContainer.innerHTML = ''; 
    
    if (animalData.destaques && animalData.destaques.length > 0) {
        animalData.destaques.forEach(destaque => {
            const spanTag = document.createElement('span');
            spanTag.className = 'tag';
            spanTag.innerText = destaque;
            tagsContainer.appendChild(spanTag);
        });
    }

    const textoFormatado = `<p>${animalData.descricao.replace(/\n/g, '</p><p>')}</p>`;
    document.getElementById('modal-texto').innerHTML = textoFormatado;

    const boxFonte = document.getElementById('modal-fonte');
    if (animalData.fonte) {
        boxFonte.innerHTML = `<strong>FONTE:</strong> <a href="${animalData.fonte}" target="_blank">${animalData.fonte}</a>`;
        boxFonte.style.display = 'block';
    } else {
        boxFonte.style.display = 'none';
    }

    const modal = document.getElementById('modal-animal');
    modal.classList.add('ativo');

    tocarAudio(animalData.audio);
}

function tocarAudio(caminhoAudio) {
    if (audioAtual) {
        audioAtual.pause();
        audioAtual.currentTime = 0;
    }

    const indicadorSom = document.getElementById('modal-status-som');
    indicadorSom.style.display = 'inline-flex';

    audioAtual = new Audio(caminhoAudio);
    audioAtual.play().catch(e => {
        console.log("Nota: Arquivo de áudio não encontrado no diretório local ainda.", e);
        indicadorSom.style.display = 'none';
    });

    audioAtual.onended = () => {
        indicadorSom.style.display = 'none';
    };
}

function fecharModal() {
    const modal = document.getElementById('modal-animal');
    modal.classList.remove('ativo');

    if (audioAtual) {
        audioAtual.pause();
        audioAtual.currentTime = 0;
    }
}

function fecharModalFora(event) {
    if (event.target.id === 'modal-animal') {
        fecharModal();
    }
}

// Inicializador
window.onload = () => {
    gerarCards();
};


// ==========================================
// FUNÇÕES PARA O MODAL E TELA CHEIA DO VÍDEO
// ==========================================

function abrirModalVideo() {
    const modalVideo = document.getElementById('modal-video');
    modalVideo.classList.add('ativo');

    // Se houver algum áudio de animal tocando, pausa ele para não misturar com o vídeo
    if (audioAtual) {
        audioAtual.pause();
    }

    const player = document.getElementById('player-video');
    
    // Inicia o vídeo
    player.play().catch(e => console.log("O autoplay pode estar bloqueado pelo navegador", e));

    // Solicita a tela cheia para o elemento de vídeo (com suporte a múltiplos navegadores)
    if (player.requestFullscreen) {
        player.requestFullscreen();
    } else if (player.webkitRequestFullscreen) { /* Safari */
        player.webkitRequestFullscreen();
    } else if (player.msRequestFullscreen) { /* IE11 / Edge antigo */
        player.msRequestFullscreen();
    }
}

function fecharModalVideo() {
    const modalVideo = document.getElementById('modal-video');
    modalVideo.classList.remove('ativo');

    const player = document.getElementById('player-video');
    player.pause();
    player.currentTime = 0; 
}

function fecharModalVideoFora(event) {
    if (event.target.id === 'modal-video') {
        fecharModalVideo();
    }
}

// Detecta quando o usuário sai da tela cheia (ex: apertando ESC) para fechar o modal
document.addEventListener('fullscreenchange', verificarSaidaTelaCheia);
document.addEventListener('webkitfullscreenchange', verificarSaidaTelaCheia);

function verificarSaidaTelaCheia() {
    // Se não houver nenhum elemento em tela cheia no documento, significa que o usuário saiu
    if (!document.fullscreenElement && !document.webkitIsFullScreen) {
        fecharModalVideo();
    }
}