import mongoose, { ClientSession, Types } from 'mongoose';
import User from '../models/user.model';

export interface MarkProblemSolvedArgs {
  userId: string | Types.ObjectId;
  problemId: string | Types.ObjectId;
  session?: ClientSession;
}

export interface MarkProblemSolvedResult {
  newlySolved: boolean;
  solvedCount: number;
}

/**
 * Idempotently marks a problem as solved for a user.
 * - Adds problemId to completedSolutions if not present
 * - Increments stats.problemsSolved only when newly added
 * - Runs inside a transaction for concurrency safety
 */
export async function markProblemSolved(
  args: MarkProblemSolvedArgs
): Promise<MarkProblemSolvedResult> {
  const { userId, problemId, session } = args;

  const useExternalSession = Boolean(session);

  // If we are inside a caller's transaction/session, DO NOT open another transaction
  if (useExternalSession) {
    // Perform idempotent updates within provided session
    const addRes = await User.updateOne(
      { _id: userId },
      { $addToSet: { completedSolutions: problemId } },
      { session }
    );

    const newlySolved = addRes.modifiedCount > 0;

    if (newlySolved) {
      await User.updateOne(
        { _id: userId },
        { $inc: { 'stats.problemsSolved': 1 } },
        { session }
      );
    }

    const updatedUser = await User.findById(userId)
      .select('stats.problemsSolved completedSolutions')
      .session(session!)
      .lean();

    const solvedCountValue = (updatedUser?.stats?.problemsSolved ?? null) as number | null;
    return {
      newlySolved,
      solvedCount:
        solvedCountValue !== null
          ? solvedCountValue
          : Array.isArray(updatedUser?.completedSolutions)
          ? updatedUser!.completedSolutions.length
          : 0,
    };
  }

  // Otherwise, create our own session and run in a transaction
  const txnSession = await mongoose.startSession();
  try {
    let result: MarkProblemSolvedResult = { newlySolved: false, solvedCount: 0 };

    await txnSession.withTransaction(async () => {
      const addRes = await User.updateOne(
        { _id: userId },
        { $addToSet: { completedSolutions: problemId } },
        { session: txnSession }
      );

      const newlySolved = addRes.modifiedCount > 0;

      if (newlySolved) {
        await User.updateOne(
          { _id: userId },
          { $inc: { 'stats.problemsSolved': 1 } },
          { session: txnSession }
        );
      }

      const updatedUser = await User.findById(userId)
        .select('stats.problemsSolved completedSolutions')
        .session(txnSession)
        .lean();

      const solvedCount = (updatedUser?.stats?.problemsSolved ?? null) as number | null;
      result = {
        newlySolved,
        solvedCount:
          solvedCount !== null
            ? solvedCount
            : Array.isArray(updatedUser?.completedSolutions)
            ? updatedUser!.completedSolutions.length
            : 0,
      };
    });

    return result;
  } finally {
    txnSession.endSession();
  }
}


