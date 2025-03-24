const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');

exports.createPost = async (req, res) => {
  try {
    const { caption, location, hashtags } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    // Upload images to cloudinary
    const uploadPromises = files.map(file => 
      cloudinary.uploader.upload(file.path, {
        folder: 'mixy_posts'
      })
    );

    const uploadedImages = await Promise.all(uploadPromises);
    const imageUrls = uploadedImages.map(img => img.secure_url);

    const post = new Post({
      user: req.user._id,
      caption,
      images: imageUrls,
      location,
      hashtags: hashtags ? hashtags.split(',').map(tag => tag.trim()) : []
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feed' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating like' });
  }
}; 