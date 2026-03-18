// Função para mostrar mensagem
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

// Manipular seleção de arquivo
const fileInput = document.getElementById('videoFile');
const fileText = document.getElementById('fileText');
const fileLabel = document.querySelector('.file-input-label');

fileInput.addEventListener('change', function (e) {
    if (this.files.length > 0) {
        fileText.textContent = this.files[0].name;
    } else {
        fileText.textContent = 'Clique para selecionar ou arraste aqui';
    }
});

// Drag and drop para upload de arquivo
fileLabel.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.style.borderColor = '#667eea';
    this.style.background = '#f5f7ff';
});

fileLabel.addEventListener('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.style.borderColor = '';
    this.style.background = '';
});

fileLabel.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.style.borderColor = '';
    this.style.background = '';

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
        fileInput.files = files;
        fileText.textContent = files[0].name;
    } else {
        showMessage('Por favor, arraste apenas arquivos de vídeo!', 'error');
    }
});

// Manipular envio do formulário
document.getElementById('videoForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('videoFile');
    const file = fileInput.files[0];

    // Verificar se tem arquivo
    if (!file) {
        showMessage('Por favor, selecione um arquivo de vídeo!', 'error');
        return;
    }

    // Verificar tamanho do arquivo
    const fileSizeMB = file.size / 1024 / 1024;
    console.log('Tamanho do arquivo:', fileSizeMB.toFixed(2), 'MB');

    // Para arquivos grandes, avisar
    if (fileSizeMB > 50) {
        if (!confirm(`Este arquivo tem ${fileSizeMB.toFixed(1)}MB. Arquivos grandes podem demorar para fazer upload. Continuar?`)) {
            return;
        }
    }

    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
        showMessage('Arquivo muito grande! Máximo 200MB.', 'error');
        return;
    }

    showMessage('Fazendo upload do vídeo...', 'success');

    // Desabilitar botão durante o upload
    const btn = document.querySelector('.btn-submit');
    btn.disabled = true;
    btn.style.opacity = '0.6';

    try {
        // Criar FormData para enviar o arquivo
        const formData = new FormData();
        formData.append('video', file);

        // Enviar para o servidor
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro ao fazer upload');
        }

        const result = await response.json();

        if (result.success) {
            showMessage('Vídeo enviado com sucesso!', 'success');

            // Limpar formulário
            document.getElementById('videoFile').value = '';
            document.getElementById('fileText').textContent = 'Clique para selecionar ou arraste aqui';

            // Animação de sucesso
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.style.background = '';
                btn.disabled = false;
                btn.style.opacity = '1';
            }, 2000);
        } else {
            throw new Error(result.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        showMessage('Erro ao enviar vídeo. Verifique se o servidor está rodando.', 'error');
        btn.disabled = false;
        btn.style.opacity = '1';
    }
});