var express = require('express')

var app = express()
  , blog = express()
  , blogAdmin = express();

app.use('/blog', blog);
blog.use('/admin', blogAdmin);
app.use('/asdf', blogAdmin);

console.log(blogAdmin.parent.mountpath);
//console.log(app.path()); // ''
//console.log(blog.path()); // '/blog'
//console.log(blogAdmin.path()); // '/blog/admin'