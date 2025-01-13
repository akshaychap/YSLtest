document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        alert('Please select a PDF file!');
        return;
    }

    const file = fileInput.files[0];
    console.log('File selected:', file);

    try {
        // Step 1: Extract text from the PDF
        const text = await extractTextFromPDF(file);
        if (!text) {
            alert('Failed to extract text from the PDF.');
            return;
        }
        console.log('Extracted PDF text:', text);

        // Step 2: Send text to the backend for AI insights
        const insights = await getAIInsights(text);
        if (insights) {
            displayResults(insights);
        } else {
            alert('Failed to get insights from the backend.');
        }
    } catch (error) {
        console.error('Error occurred during upload and analyze process:', error);
        alert('An error occurred. Check the console for details.');
    }
});

// Extract text from PDF using PDF.js
async function extractTextFromPDF(file) {
    console.log('Starting PDF text extraction...');

    const pdfjsLib = window['pdfjs-dist/build/pdf']; // Use the globally loaded PDF.js library
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }

    console.log('PDF text extraction completed.');
    return text;
}

// Call the backend to get AI insights
async function getAIInsights(text) {
    console.log('Starting backend API call...');
    const backendUrl = 'https://ysltest.onrender.com/analyze'; // Replace with your Render URL

    const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend API Error:', errorText);
        return null;
    }

    const data = await response.json();
    console.log('Backend API call successful. Insights:', data);
    return data.response; // Extract the generated response
}

// Display results on the page
function displayResults(results) {
    console.log('Displaying results...');
    const resultsElement = document.getElementById('results');
    resultsElement.innerText = results;
}
