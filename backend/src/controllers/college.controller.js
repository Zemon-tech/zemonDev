import { College } from '../models/index.js';
import logger from '../utils/logger.js';

// Get all colleges (paginated)
export const getColleges = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.validatedQuery;
    const skip = (page - 1) * limit;

    const [colleges, total] = await Promise.all([
      College.find()
        .select('-domains -__v')
        .sort('name')
        .skip(skip)
        .limit(limit),
      College.countDocuments(),
    ]);

    res.json({
      colleges,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Error fetching colleges' });
  }
};

// Get college by ID
export const getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id)
      .select('-domains -__v');

    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    res.json(college);
  } catch (error) {
    logger.error('Error fetching college:', error);
    res.status(500).json({ error: 'Error fetching college' });
  }
};

// Create new college (admin only)
export const createCollege = async (req, res) => {
  try {
    const college = new College(req.validatedBody);
    await college.save();

    logger.info(`Created new college: ${college.name}`);
    res.status(201).json(college);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate college',
        details: 'A college with this short name already exists',
      });
    }
    logger.error('Error creating college:', error);
    res.status(500).json({ error: 'Error creating college' });
  }
};

// Update college (admin only)
export const updateCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Update allowed fields
    const { name, shortName, university, location, website, domains } = req.validatedBody;

    if (name) college.name = name;
    if (shortName) college.shortName = shortName;
    if (university) college.university = university;
    if (location) college.location = location;
    if (website) college.website = website;
    if (domains) college.domains = domains;

    await college.save();
    logger.info(`Updated college: ${college.name}`);
    res.json(college);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate college',
        details: 'A college with this short name already exists',
      });
    }
    logger.error('Error updating college:', error);
    res.status(500).json({ error: 'Error updating college' });
  }
};

// Delete college (admin only)
export const deleteCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    if (college.studentCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete college',
        details: 'College has active students',
      });
    }

    await college.deleteOne();
    logger.info(`Deleted college: ${college.name}`);
    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    logger.error('Error deleting college:', error);
    res.status(500).json({ error: 'Error deleting college' });
  }
};

// Search colleges
export const searchColleges = async (req, res) => {
  try {
    const { query } = req.validatedQuery;
    const colleges = await College.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { shortName: { $regex: query, $options: 'i' } },
        { university: { $regex: query, $options: 'i' } },
        { 'location.city': { $regex: query, $options: 'i' } },
        { 'location.state': { $regex: query, $options: 'i' } },
      ],
    })
      .select('name shortName university location')
      .limit(10);

    res.json(colleges);
  } catch (error) {
    logger.error('Error searching colleges:', error);
    res.status(500).json({ error: 'Error searching colleges' });
  }
};

// Verify college domain
export const verifyCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    college.isVerified = true;
    await college.save();

    logger.info(`Verified college: ${college.name}`);
    res.json({ message: 'College verified successfully' });
  } catch (error) {
    logger.error('Error verifying college:', error);
    res.status(500).json({ error: 'Error verifying college' });
  }
}; 