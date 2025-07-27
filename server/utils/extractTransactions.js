const genAI = require('../config/geminiClient');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function extractTransactionDetails(text) {
  try {
    const prompt = `
You are an intelligent expense analyzer.

Given this transaction text:

"${text}"

Predict the most likely category such as:
- Food & Beverages
- Groceries
- Travel
- Clothes & Accessories
- Education
- Bills & Utilities
- Entertainment
- Health
- Other

Return a valid JSON like:
{
  "amount": number,
  "date": "YYYY-MM-DD",
  "merchant": string,
  "category": string
}
Focus on making sure the category is reasonable for this transaction. 
Only output valid JSON, without any explanation.`;

    const result = await model.generateContent(prompt);
    let response = await result.response.text();
    // Remove markdown code block if present
    response = response.replace(/```json|```/g, '').trim();
    return JSON.parse(response);
  } catch (err) {
    console.error("Gemini parse failed", err);
    return null;
  }
}

module.exports = extractTransactionDetails;
