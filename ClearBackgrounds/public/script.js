document.getElementById('uploadBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Veuillez sélectionner une image à télécharger.');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/process-image', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.imageUrl) {
            document.getElementById('resultImage').src = data.imageUrl;
            document.getElementById('downloadLink').href = data.imageUrl;
            document.getElementById('result').style.display = 'block';
        } else {
            alert('Erreur lors du traitement de l\'image.');
        }
    } catch (error) {
        alert('Erreur lors du téléchargement de l\'image.');
        console.error('Error:', error);
    }
});
