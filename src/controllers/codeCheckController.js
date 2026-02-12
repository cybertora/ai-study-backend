import { checkCode } from '../services/openaiService.js';

export const checkCodeQuality = async (req, res, next) => {
  try {
    const { code, language, taskDescription } = req.body;

    const result = await checkCode(code, language, taskDescription);

    res.status(200).json({
      success: true,
      message: 'Code checked successfully',
      data: {
        errors: result.errors,
        improvements: result.improvements,
        score: result.score,
        explanation: result.explanation,
      },
    });
  } catch (error) {
    next(error);
  }
};
