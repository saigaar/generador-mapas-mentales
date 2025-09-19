
export const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (!event.target?.result) {
                    return reject(new Error("Failed to read PDF file."));
                }
                if (!window.pdfjsLib) {
                    return reject(new Error("pdf.js library is not loaded."));
                }
                try {
                    const pdf = await window.pdfjsLib.getDocument(event.target.result).promise;
                    const numPages = pdf.numPages;
                    let fullText = '';
                    for (let i = 1; i <= numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                        fullText += pageText + '\n';
                    }
                    resolve(fullText);
                } catch (error) {
                    console.error("Error parsing PDF:", error);
                    reject(new Error("Error parsing PDF file. It may be corrupted or protected."));
                }
            };
            reader.onerror = () => reject(new Error("Error reading file."));
            reader.readAsArrayBuffer(file);
        } else if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (typeof event.target?.result === 'string') {
                    resolve(event.target.result);
                } else {
                    reject(new Error("Failed to read text file."));
                }
            };
            reader.onerror = () => reject(new Error("Error reading file."));
            reader.readAsText(file);
        } else {
            reject(new Error("Unsupported file type. Please upload a PDF or TXT file."));
        }
    });
};
