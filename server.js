import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { FormData } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import multer from 'multer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer pour le téléchargement de fichiers
const upload = multer({ dest: 'uploads/' });

// Middleware pour servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Fonction pour retirer l'arrière-plan d'une image
async function removeBackgroundFromImage(imagePath) {
    const url = 'https://api.remove.bg/v1.0/removebg';
    const form = new FormData();
    form.set('image_file', await fileFromPath(imagePath));
    form.set('size', 'auto');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Api-Key': process.env.REMOVE_BG_API_KEY,
            },
            body: form,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.buffer();
        const outputPath = path.join(__dirname, 'public', 'output.png');
        fs.writeFileSync(outputPath, data);

        return `/output.png`; // Lien relatif vers l'image traitée
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour traiter les images
app.post('/process-image', upload.single('image'), async (req, res) => {
    try {
        const imagePath = req.file.path;
        console.log('Preparing request to remove.bg API...');
        const imageUrl = await removeBackgroundFromImage(imagePath);
        if (!imageUrl) throw new Error('Failed to remove background.');

        // Supprimer le fichier téléchargé après traitement
        fs.unlinkSync(imagePath);

        res.json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: `Error processing image: ${error.message}` });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

