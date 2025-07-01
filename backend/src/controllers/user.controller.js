import { User, College } from '../models/index.js';
import logger from '../utils/logger.js';

// Get current user's profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByClerkId(req.auth.userId)
      .populate('collegeId', 'name shortName')
      .select('-__v');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

// Update current user's profile
export const updateCurrentUser = async (req, res) => {
  try {
    const user = await User.findByClerkId(req.auth.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    const { fullName, profile, branch, year, interests } = req.validatedBody;
    
    if (fullName) user.fullName = fullName;
    if (profile) {
      user.profile = {
        ...user.profile,
        ...profile,
      };
    }
    if (branch) user.branch = branch;
    if (year) user.year = year;
    if (interests) user.interests = interests;

    await user.save();
    res.json(user);
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user profile' });
  }
};

// Get public profile of any user
export const getUserProfile = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const user = await User.findByClerkId(clerkId)
      .populate('collegeId', 'name shortName')
      .select('fullName profile collegeId branch year interests stats');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

// Handle Clerk webhook for user creation/updates
export const handleClerkWebhook = async (req, res) => {
  const { type, data } = req.body;

  try {
    switch (type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = data;
        const primaryEmail = email_addresses.find(e => e.id === data.primary_email_address_id);

        // Check if user's email domain matches a college
        const college = await College.findByDomain(primaryEmail.email_address);

        const user = new User({
          clerkId: id,
          email: primaryEmail.email_address,
          fullName: `${first_name || ''} ${last_name || ''}`.trim(),
          collegeId: college?._id,
        });

        await user.save();

        // Update college student count if found
        if (college) {
          await college.incrementStudentCount();
        }

        logger.info(`Created new user: ${id}`);
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = data;
        const primaryEmail = email_addresses.find(e => e.id === data.primary_email_address_id);

        const user = await User.findByClerkId(id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // If email changed, update college affiliation
        if (user.email !== primaryEmail.email_address) {
          const oldCollege = user.collegeId;
          const newCollege = await College.findByDomain(primaryEmail.email_address);

          if (oldCollege) {
            const oldCollegeDoc = await College.findById(oldCollege);
            if (oldCollegeDoc) {
              await oldCollegeDoc.decrementStudentCount();
            }
          }

          if (newCollege) {
            await newCollege.incrementStudentCount();
            user.collegeId = newCollege._id;
          } else {
            user.collegeId = null;
          }

          user.email = primaryEmail.email_address;
        }

        user.fullName = `${first_name || ''} ${last_name || ''}`.trim();
        await user.save();

        logger.info(`Updated user: ${id}`);
        break;
      }

      case 'user.deleted': {
        const { id } = data;
        const user = await User.findByClerkId(id);
        
        if (user && user.collegeId) {
          const college = await College.findById(user.collegeId);
          if (college) {
            await college.decrementStudentCount();
          }
        }

        await User.deleteOne({ clerkId: id });
        logger.info(`Deleted user: ${id}`);
        break;
      }

      default:
        logger.warn(`Unhandled webhook type: ${type}`);
        return res.status(400).json({ error: 'Unhandled webhook type' });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error handling Clerk webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
};

// Get user's completed solutions
export const getUserSolutions = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const user = await User.findByClerkId(clerkId)
      .populate({
        path: 'completedSolutions',
        populate: {
          path: 'problemId',
          select: 'title difficulty tags',
        },
      })
      .select('completedSolutions');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.completedSolutions);
  } catch (error) {
    logger.error('Error fetching user solutions:', error);
    res.status(500).json({ error: 'Error fetching user solutions' });
  }
};

// Get user's bookmarked resources
export const getUserBookmarks = async (req, res) => {
  try {
    const user = await User.findByClerkId(req.auth.userId)
      .populate({
        path: 'bookmarkedResources',
        select: 'title type description tags difficulty metrics',
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.bookmarkedResources);
  } catch (error) {
    logger.error('Error fetching user bookmarks:', error);
    res.status(500).json({ error: 'Error fetching user bookmarks' });
  }
}; 