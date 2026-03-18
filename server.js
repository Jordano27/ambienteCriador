const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da raiz do projeto (um nível acima)
app.use(express.static(path.join(__dirname, '..')));

// Servir a pasta upload
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Configurar armazenamento do multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'upload');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, name + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de vídeo são permitidos!'));
        }
    }
});

// Rota para upload de vídeo
app.post('/api/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const videoData = {
            id: Date.now().toString(),
            fileName: req.file.originalname,
            savedFileName: req.file.filename,
            path: `/upload/${req.file.filename}`,
            size: req.file.size,
            type: 'file',
            addedAt: new Date().toISOString()
        };

        res.json({ success: true, video: videoData });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ error: 'Erro ao fazer upload do vídeo' });
    }
});

// Rota para listar vídeos
app.get('/api/videos', (req, res) => {
    try {
        const uploadDir = path.join(__dirname, 'upload');

        if (!fs.existsSync(uploadDir)) {
            return res.json([]);
        }

        const files = fs.readdirSync(uploadDir);
        const videos = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'].includes(ext);
            })
            .map(file => {
                const stats = fs.statSync(path.join(uploadDir, file));
                return {
                    id: file,
                    fileName: file,
                    savedFileName: file,
                    path: `/upload/${file}`,
                    size: stats.size,
                    type: 'file',
                    addedAt: stats.birthtime.toISOString()
                };
            })
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

        res.json(videos);
    } catch (error) {
        console.error('Erro ao listar vídeos:', error);
        res.status(500).json({ error: 'Erro ao listar vídeos' });
    }
});

// Rota para deletar vídeo
app.delete('/api/videos/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'upload', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'Vídeo removido com sucesso' });
        } else {
            res.status(404).json({ error: 'Vídeo não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao deletar vídeo:', error);
        res.status(500).json({ error: 'Erro ao deletar vídeo' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Ambiente Criador: http://localhost:${PORT}/ambienteCriador/`);
    console.log(`Meu YouTube: http://localhost:${PORT}/meuYoutube/`);
});
