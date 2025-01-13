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

        // Step 2: Get AI-generated insights
        const insights = await getAIInsights(text);
        if (insights) {
            displayResults(insights);
        } else {
            alert('Failed to get insights from ChatGPT.');
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

// Call OpenAI API for insights
async function getAIInsights(text) {
    console.log('Starting OpenAI API call...');
    const apiKey = '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'; // Replace with your OpenAI API Key
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: `
                    Analyze the following data:

                    ${text}

                    Provide:
                    1. A high-level executive summary.
                    2. Total impact (number of projects, statistics, amount of money raised).
                    3. Project notes (summarize each project briefly).
                    4. Key risks or attention-needed areas.
                    5. Citations for each output (mention where the data was stated in the PDF).
                    `
                }
            ]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error:', errorText);
        return null;
    }

    const data = await response.json();
    console.log('OpenAI API call successful. Insights:', data);
    return data.choices[0].message.content;
}

// Display results on the page
function displayResults(results) {
    console.log('Displaying results...');
    const resultsElement = document.getElementById('results');
    resultsElement.innerText = results;
}
