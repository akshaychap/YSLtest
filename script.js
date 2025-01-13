document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        alert('Please select a file!');
        return;
    }

    const file = fileInput.files[0];
    const text = await extractTextFromPDF(file);
    const results = await getAIInsights(text);
    document.getElementById('results').innerText = results;
});

// Extract text from PDF using PDF.js
async function extractTextFromPDF(file) {
    const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js');
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
}

// Call OpenAI API for insights
async function getAIInsights(text) {
    const apiKey = 'YOUR_OPENAI_API_KEY';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: `Analyze this data:\n\n${text}` }]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}
