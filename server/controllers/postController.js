// View posts
exports.view = (req, res) => {
  // Connect to database
  pool.getConnection((err, connection) => {
    if (err) throw err;  // not connected
    //if(err) console.log('error');  // not connected
    console.log('Connected as ID ' + connection.threadId);

    // Use the connection
    connection.query('SELECT * FROM christmas_post', (err, result) => {
      // When done with the connection, release it
      connection.release();

      if(!err) {
        res.render('post', {posts : result});
      } else {
        console.log(err);
      }

      //console.log('The data from posts table : \n', result);

    });
  });

};