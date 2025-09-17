const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const bodyParser = require('body-parser');

/**
 * GET /
 * HOME
*/
router.get('/', async (req, res) => {
  try {
    const single = await Post.findOne();

    const locals = {
      title: "Home Page",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
      maintitle: single.title
    }

    let perPage = 3;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: - 1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.count();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', {
      locals
      , data
      , current: page
      , nextPage: hasNextPage ? nextPage : null
      , currentRoute: "/"
    });

  } catch (error) {
    console.log(error);
  }
});

// WITHOUT PAGINATION
// router.get('', async (req, res) => {
//   const locals = {
//     title: "Home Pages",
//     description: "Simple Blog created with NodeJs, Express & MongoDb."
//   }

//   try {
//     const data = await Post.find();

//     res.render('index', { locals, data });

//   } catch (error) {
//     console.log(error);
//   }
// });

/**
 * GET /
 * Post :id
*/
router.get('/post/:id', async (req, res) => {
  try {
    const locals = {
      title: "Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    let slug = req.params.id;

    const data = await Post.findById({ _id: slug });

    res.render('post', { locals, data, currentRoute: `/post/${slug}` });

  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Post :searchTerm
*/
router.post('/search', async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    let searchTerm = req.body.searchTerm;
    const searchNoChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    console.log(searchNoChars);

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoChars, 'i') } },
        { body: { $regex: new RegExp(searchNoChars, 'i') } }
      ]
    });

    res.render("search", {
      data,
      locals
    });

  } catch (error) {
    console.log(error);
  }
});

router.get('/about', (req, res) => {
  res.render('about', {currentRoute: '/about'});
});
module.exports = router;

// function insertPostData () {
//   Post.insertMany([
//     {
//       title: "Favorite Christmas Movies",
//       categoryid: "66e9a4d3c0f0735525d2e7b5",
//       slug: "favorite-christmas-movies",
//       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//     },
//     {
//       title: "Favorite Christmas Music",
//       categoryid: "66e994ddcc48d108e19e3f02",
//       slug: "favorite-christmas-music",
//       body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments..."
//     },
//     {
//       title: "The Christmas Carol Awards",
//       categoryid: "66e9a4d3c0f0735525d2e7b5",
//       slug: "christmas-carol-awards",
//       body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//     },
//     {
//       title: "Going to Grandma's",
//       categoryid: "66e9a4efc0f0735525d2e7b6",
//       slug: "going-to-grandmas",
//       body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//     },
//     {
//       title: "A Christmas Carol",
//       categoryid: "66e9a499c0f0735525d2e7b3",
//       slug: "a-christmas-carol",
//       body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//     },
//     {
//       title: "Christmas Ham",
//       categoryid: "66e9a4b6c0f0735525d2e7b4",
//       slug: "christmas-ham",
//       body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//     }
//   ])
// }

// insertPostData();
