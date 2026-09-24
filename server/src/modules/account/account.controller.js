import { 
  User, 
  Resume, 
  SearchHistory, 
  RefreshToken, 
  PasswordResetToken, 
  SearchReservation 
} from '../../models/index.js';
import { verifyPassword } from '../../utils/passwords.js';
import { clearAuthCookies } from '../../utils/cookies.js';
import { AppError } from '../../utils/errors.js';
import storageService from '../../services/storage.service.js';

export const deleteAccount = async (req, res) => {
  const { password, confirmation } = req.body;
  const userId = req.userId;

  // Validation ensures confirmation is 'DELETE', but we can double check
  if (confirmation !== 'DELETE') {
    throw new AppError(400, 'VALIDATION_ERROR', 'Confirmation must be exactly "DELETE"');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(403, 'FORBIDDEN', 'Invalid password');
  }

  // 1. Delete all R2 objects for the user's resumes
  const userResumes = await Resume.find({ userId });
  for (const resume of userResumes) {
    if (resume.rawFileObjectKey) {
      try {
        await storageService.deleteResumeFromR2(resume.rawFileObjectKey);
      } catch (err) {
        console.error(`Failed to delete R2 object for resume ${resume._id}:`, err);
        // Continue deleting despite R2 error to ensure the account gets deleted
      }
    }
  }

  // 2. Cascade delete all MongoDB documents
  await Resume.deleteMany({ userId });
  await SearchHistory.deleteMany({ userId });
  await RefreshToken.deleteMany({ userId });
  await PasswordResetToken.deleteMany({ userId });
  await SearchReservation.deleteMany({ userId });
  
  // 3. Delete the User document
  await User.deleteOne({ _id: userId });

  // 4. Clear authentication cookies
  clearAuthCookies(res);

  return res.status(204).send();
};
