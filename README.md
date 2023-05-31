
# Express

This repository contains code for NATOURS API built with Node.js and Express that serves tour destinations and users data from a JSON file.
The Repository is created as part of The complete Node.js, Express and MongoDB bootcamp on [Udemy](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/) by instructor Jonas Schmedtmann. I included short notes so that it becomes easier to remember concepts next time I visit it.

## What I learned

During the course, I learned  a Ton of concepts and techniques:

- ### The request-response cycle and how it applies to building web applications with Node.js and Express.

    - The Request-Response Cycle is the fundamental concept behind how web servers and clients communicate. When a client (such as a web   browser) sends a request to a server, the server processes the request and sends back a response. In Express, this cycle is handled by defining routes and middleware functions. The Request-Response Cycle is like a pipe passing the request and response object to be processed by middleware functions and handlers.

- ### How to use relevant methods of the request and response objects in Express to handle requests and generate responses.
      
    - The request and response objects in Express have many methods that you can use to handle requests and generate responses. Some of the most commonly used methods include.

##### Request Object

- `req.params`: An object containing properties mapped to the named route parameters.
- `req.query`: An object containing key-value pairs of query string parameters. 
- `req.body`: An object containing the parsed request body, typically used for handling form data or JSON payloads.
- `req.cookies`: An object containing cookies sent by the client.
- `req.headers`: An object containing the HTTP request headers.
- `req.method`: The HTTP request method, such as `GET` or `POST`.
- `req.path`: The request URL path, excluding the query string.
- `req.protocol`: The request protocol, such as `http` or `https`.
- `req.ip`: The IP address of the client making the request.
- `req.get(headerName)`: Returns the value of the specified request header.

##### Response Object

- `res.send(body)`: Sends a response with the specified body. The body can be a string, an object, an array, or a Buffer.
- `res.json(body)`: Sends a response with the specified JSON-encoded body. 
- `res.status(code)`: Sets the HTTP status code of the response.
- `res.cookie(name, value, [options])`: Sets a cookie with the specified name and value.
- `res.clearCookie(name, [options])`: Clears the specified cookie by setting its value to an empty string.
- `res.redirect([status,] path)`: Redirects the client to the specified URL or path. 
- `res.render(view, [locals], callback)`: Renders a view template using the specified view engine and data.

- ### How to define response handlers for specific routes in Express.

    - Response handlers are functions that generate the response that will be sent back to the client for specific paths.

    Example - ``` npm install express ``` installaing the express package
              ``` const express = require('express')``` importing the commonjs module
              ``` const app = express()``` creating the app instance.
              ``` app.get('/blog', (req, res) => {
                       res.send('You are visiting the blog section.')})  
              ``
             Here we are sending 'You are visiting the blog section'. when the user tries to vsit the /blog section.
- ### How to use middleware functions to handle tasks such as parsing request bodies, authenticating users, and logging requests.

    - Middleware functions are functions that have access to the request and response objects, and can modify them before passing them on to the next middleware function in the stack. Express uses middleware functions to handle tasks such as parsing request bodies, authenticating users, and logging requests. the have a 3rd parameter next() to be called everytime, otherwise the flow is stuck and the next middleware fucntion can't access the request-response object.

    Example - ``` app.use(express.json()); ``` parsing the request body.

- ### How to use third-party middleware functions like Morgan to log HTTP requests in an Express application.
    - Morgan is a popular middleware function for logging HTTP requests in Express. It provides detailed information about each request, such as the request method, URL, and response status code.

    Example - ``` npm install morgan ``` installing the morgan package
              ``` const morgan = require('morgan')``` importing the commonjs module
              ``` app.use(morgan('dev))``` mounting 
              ``` GET /api/v1/tours 200 3.354 ms - 8514 ``` output when an HTTP request is recieved.

### How to define routes and routers in Express to organize an application's functionality.

-  Routes are the paths that clients use to access the application, and routers are objects that handle requests to those paths. The principle of router works just like the device, it distributes incoming requests for thier corresponding handlers. In Express, you can define routes and routers to organize your application's functionality.

     Example - ``` const router = express.Router()``` creates a router to handle routes.
               ``` router.route('/api/v1/users').get(req, res) => res.status(200).json({status: "success"}, data: data)```
               ``` router.route('/api/v1/users/4').get(req, res) => res.status(200).json({status: "success"}, data: data[4])```

- ### How to mount middleware functions and routers to specific paths in an Express application to create modular, reusable code.

    - Mounting refers to the process of attaching middleware functions and routers to specific paths in an Express application. This allows you to create modular, reusable code that can be easily added or removed from your application. 

    Example - ``` app.use('/api/v1/tours', router) ``` router handles requests the hit /api/v1/tours.

- ### How to build and test APIs with Postman, a popular tool for interacting with APIs.

    - Postman is a popular tool that simplifies testing APIs. It allows you to send requests using several HTTP methods to your API and inspect the responses in real time.You can download it from the official website: https://www.postman.com/downloads/. it is simple to use and user friendly.

- ### The principles of RESTful API architecture, including how to use HTTP methods to perform CRUD operations on resources.

    - RESTful APIs (Representational State Transfer APIs) are a style of web architecture that follows a set of constraints to make API usages more logical and easily understandable. RESTful APIs use HTTP methods (such as GET, POST, PUT, and DELETE) to perform CRUD (Create, Read, Update, Delete) operations on resources, which can be represented as URLs. The basic principles of RESTful APIs include:

      **Client-server architecture**: The client and server are separate and communicate through HTTP requests and responses.

      **Statelessness**: Each request from the client to the server contains all the information needed to complete the request. This means that the server does not store any client state between requests, which allows for better scalability and reliability.

      **Cacheability**: Responses from the server can be cached by the client to improve performance.

      **Layered system**: A client may not be able to tell whether it is communicating directly with the server or with an intermediary, such as a load balancer or a proxy server.

      **Uniform interface**: RESTful APIs use a uniform interface to make it easy to access and manipulate resources. This includes using HTTP methods (such as GET, POST, PUT, and DELETE) to perform CRUD operations on resources, and using HTTP status codes to indicate the outcome of each request.
- ### How to use environment variables to configure an Express application for different environments (such as development and production).

    - Environment variables are variables that are set outside of the application code and can be accessed by the application. In Express, you can use environment variables to configure your application for different environments. In this repo I created a config.env configuration file at the root folder that stores sensetive informations like API_KEYS, USERNAMES and PASSWORDS as enviroment variables. to be accssed later with `` process.env `` 

    Example - ``` npm install dotenv ``` installing the dotenv package that loads the enviroment variables from `config.env `to the `process.env` object.
              ``` const dotenv = require('dotenv')``` importing the module
              ``` dotenv.config({path: './config.env'})```
              ``` console.log(process.env.NODE_ENV)``` logs the current enviroment

- ### How to serve static files from a directory in an Express application.

     - Static files (such as HTML, CSS, and images) are files that are served directly to clients without any processing by the server. In   Express, you can serve static files by specifying a directory to serve them from.

     Example - ``app.use(express.static(`${__dirname}/src`)) `` loads the html in the browser from the src folder.

- ### How to use ESLint, a popular JavaScript linter, to enforce coding standards and catch errors before they cause problems.

  - ESLint is a popular open-source static code analysis tool for JavaScript. It is used to identify and report on patterns in code that may indicate errors, or that do not conform to a set of coding standards or best practices. ESLint helps developers to write cleaner, more consistent code by enforcing a set of rules or guidelines that ensure that code is easy to read, maintain, and debug. It can also help to catch common programming mistakes before they cause issues in production. you can see the eslint configurations in `.eslintrc.json` file.

## Installation

To run this project, you will need to have Node.js installed on your machine. You can download it from the official website: https://nodejs.org/

To install the dependencies, run the following command in your terminal:

```
npm install
```

This will install the following core dependencies:

- `express`: the core framework that I used to build the API
- `dotenv`: a module that loads environment variables from a `.env` file into `process.env`
- `morgan`: a middleware function that logs HTTP requests to the console.
- `nodemon`: a development dependency that automatically restarts the server when changes are made to the code.
- `eslint`: a development dependency that helps enforce coding standards and catch errors before they cause problems.
- `prettier`: a code formater.

Once the installation is complete, you can run the following command to start the server:

```
npm start
```

This will start the nodemon server at http://127.0.0.1:8080. which will automatically restart the server when changes are made to the code.

That's it! You should now be able to run the project and interact with the API.

## Contributing 

Contributions are welcome and encouraged! To contribute please follow these steps:

1. Fork this repository by clicking on "Fork" button at right top corner of page.
2. Create new branch: `git checkout -b my-new-feature`
3. Make changes to files according to desired feature(s).
4. Commit your changes: `git commit -am 'Add some feature'`.
5. Push to the branch: `git push origin my-new-feature`.
6. Submit a pull request by opening PR in original respository (not yours)

I review all pull requests thoroughly and appreciate every contribution made.


If you find any bugs/issues/errors please create an issue ticket/appropriate category within issues in Github.

## Credits

This repository was built as part of the "The complete Node.js, Express and MongoDB bootcamp"  on [Udemy](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/) by Jonas Schmedtmann.
