// file: backend/src/services/openaiService.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Generate lecture summary
 */
export const generateSummary = async (lectureText, title = 'Untitled Lecture') => {
  try {
    const prompt = `You are an expert academic assistant. Create a comprehensive, structured summary of the following lecture.

Lecture Title: ${title}

Lecture Content:
${lectureText}

Please provide:
1. **Main Topic** - One sentence overview
2. **Key Concepts** - Bullet points of main ideas (5-10 points)
3. **Important Details** - Critical information, formulas, definitions
4. **Examples** - Key examples mentioned
5. **Summary** - 2-3 paragraph concise summary

Format in clear markdown with headers and bullet points.`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic assistant specializing in creating clear, structured lecture summaries for university students.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error (generateSummary):', error.message);
    throw new Error('Failed to generate summary. Please try again.');
  }
};

/**
 * Generate test questions
 */
export const generateTest = async (topic, numQuestions = 10, difficulty = 'medium') => {
  try {
    const difficultyInstructions = {
      easy: 'Create straightforward questions testing basic understanding and recall.',
      medium: 'Create questions requiring understanding and application of concepts.',
      hard: 'Create challenging questions requiring deep analysis and synthesis.',
    };

    const prompt = `Generate ${numQuestions} multiple-choice questions on the topic: "${topic}".

Difficulty: ${difficulty}
Instructions: ${difficultyInstructions[difficulty]}

For each question, provide:
- A clear question
- 4 answer options (A, B, C, D)
- The correct answer
- A brief explanation (1-2 sentences)

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A) Option 1",
      "explanation": "Explanation here."
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert test generator for university-level education. Return only valid JSON without any markdown formatting or extra text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(jsonContent);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return parsed.questions;
  } catch (error) {
    console.error('OpenAI API Error (generateTest):', error.message);
    throw new Error('Failed to generate test questions. Please try again.');
  }
};

/**
 * Check code for errors and improvements
 */
export const checkCode = async (code, language, taskDescription = '') => {
  try {
    const prompt = `You are an expert code reviewer. Analyze the following ${language} code${
      taskDescription ? ` for the task: "${taskDescription}"` : ''
    }.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. **Errors**: List any syntax errors, logical errors, or bugs (if none, say "No errors found")
2. **Improvements**: Suggest code improvements (performance, readability, best practices)
3. **Score**: Rate the code from 0-100
4. **Explanation**: Brief overall assessment (2-3 sentences)

Return ONLY valid JSON in this exact format:
{
  "errors": ["Error 1", "Error 2"] or [],
  "improvements": ["Improvement 1", "Improvement 2"],
  "score": 85,
  "explanation": "Overall assessment here."
}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer with deep knowledge of programming best practices. Return only valid JSON without markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('OpenAI API Error (checkCode):', error.message);
    throw new Error('Failed to check code. Please try again.');
  }
};

/**
 * Generate cheat sheet
 */
export const generateCheatSheet = async (text, maxLength = 500, format = 'bullet') => {
  try {
    const formatInstructions = {
      bullet: 'Use bullet points and concise phrases',
      table: 'Organize in a table format with categories',
      compact: 'Create ultra-compact one-liners and abbreviations',
    };

    const prompt = `Create a study cheat sheet from the following content. Maximum length: ~${maxLength} characters.

Format: ${formatInstructions[format]}

Content:
${text}

Create a cheat sheet that:
- Captures the most important concepts
- Uses mnemonics or abbreviations where helpful
- Is easy to scan and memorize
- Highlights critical formulas, dates, names, or definitions
- ${formatInstructions[format]}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating concise, memorable study materials. Focus on the most important information.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error (generateCheatSheet):', error.message);
    throw new Error('Failed to generate cheat sheet. Please try again.');
  }
};

/**
 * Evaluate exam answer in real-time
 */
export const evaluateAnswer = async (question, correctAnswer, studentAnswer) => {
  try {
    const prompt = `Evaluate this exam answer.

Question: ${question}
Correct Answer: ${correctAnswer}
Student's Answer: ${studentAnswer}

Provide:
1. Is the student's answer correct? (yes/no)
2. Brief feedback (1-2 sentences) explaining why or offering a hint if wrong

Return ONLY valid JSON:
{
  "isCorrect": true or false,
  "feedback": "Feedback here."
}`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful exam evaluator. Be fair but constructive in your feedback.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    const content = response.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('OpenAI API Error (evaluateAnswer):', error.message);
    throw new Error('Failed to evaluate answer.');
  }
};

export default {
  generateSummary,
  generateTest,
  checkCode,
  generateCheatSheet,
  evaluateAnswer,
};
