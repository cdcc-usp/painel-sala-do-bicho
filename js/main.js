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