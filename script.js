document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        alert('Please select a PDF file!');
        return;
    }

    const file = fileInput.files[0];
    try {
        // Step 1: Extract text from the uploaded PDF
        const text = await extractTextFromPDF(file);
        if (!text) {
            alert('Failed to extract text from the PDF.');
            return;
        }

        // Step 2: Get AI-generated insights using OpenAI API
        const insights = await getAIInsights(text);
        if (insights) {
            displayResults(insights);
        } else {
            alert('Failed to get insights from ChatGPT.');
        }
    } catch (error) {
        console.error('Error processing the file:', error);
        alert('An error occurred. Check the console for details.');
    }
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
    console.log('Extracted PDF text:', text);
    return text;
}

// Call OpenAI API for insights
async function getAIInsights(text) {
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
        console.error('Error with OpenAI API:', await response.text());
        return null;
    }

    const data = await response.json();
    console.log('AI Insights:', data);
    return data.choices[0].message.content;
}

// Display results on the page
function displayResults(results) {
    const resultsElement = document.getElementById('results');
    resultsElement.innerText = results;
}
 
