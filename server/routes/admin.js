const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Category = require('../models/Category');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

/**
 * Check login
 */
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    res.redirect('/admin')
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized '} );
  }
}

/**
 * GET /
 * Admin - login page
*/
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    //const data = await Post.find();

    res.render('admin/index', { locals, layout: adminLayout });

  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /
 * Admin - check login
*/
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });

    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Admin - dashboard
*/
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Admin Dashboard",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    const data = await Post.find();
    res.render('admin/dashboard', { locals, data, layout: adminLayout, 
       currentRoute: "/dashboard" });

  } catch (error) {
    console.log(error);
  }

});

/**
 * POST /
 * Admin - register
*/
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: 'User created', user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: 'User already in use' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }

  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Admin - create new post
*/
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    const cats = await Category.find();
    const data = await Post.find();

    res.render('admin/add-post', { locals, data, cats, layout: adminLayout
      , currentRoute: "/add-post" });

  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * Admin - create new post
 */
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    try {
      var slug = req.body.title;
      slug = slug.toLowerCase();
      slug = slug.replace(" ","-");

      const newPost = new Post({

        title: req.body.title,
        categoryid : req.body.category,
        slug : slug,
        body : req.body.body
      });
      await Post.create(newPost);
    } catch(error) {
      console.log(error);
    }
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error);
  }

});

/**
 * GET /
 * Admin - edit post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    const data = await Post.findOne({_id: req.params.id});
    const cats = await Category.find();
    
    console.log(data.categoryid);
    res.render('admin/edit-post', { locals, data, cats, layout: adminLayout });

  } catch (error) {
    console.log(error);
  }
});

/**
 * PUT /
 * Admin - edit post
*/
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    //const cats = await Category.find();
    
    var slug = req.body.title;
    slug = slug.toLowerCase();
    slug = slug.replace(" ","-");

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      categoryid : req.body.category,
      slug : slug,
      body : req.body.body,
      updatedAt : Date.now()
    })
    res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.log(error);
  }
});

/**
 * DELETE
 * Admin - delete post
 */
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({_id: req.params.id});
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

// login test
// router.post('/admin', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (req.body.username === 'admin' && req.body.password === 'password') {
//       res.send('You are logged in');
//     } else {
//       res.send('Wrong username/password');
//     }

//   } catch (error) {
//     console.log(error);
//   }
// });