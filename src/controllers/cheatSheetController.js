import { generateCheatSheet } from '../services/openaiService.js';

export const createCheatSheet = async (req, res, next) => {
  try {
    const { text, maxLength, format } = req.body;

    const cheatSheet = await generateCheatSheet(
      text,
      maxLength || 500,
      format || 'bullet'
    );

    res.status(200).json({
      success: true,
      message: 'Cheat sheet generated successfully',
      data: {
        cheatSheet,
        originalLength: text.length,
        compressedLength: cheatSheet.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
