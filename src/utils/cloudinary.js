const { cloudinary } = require('../config/cloudinary');

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error('Error deleting image from Cloudinary');
  }
};

module.exports = {
  deleteImage
};