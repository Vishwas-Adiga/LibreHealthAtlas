# LibreHealth Atlas
An atlas to view LH users worldwide, written in Node.js and SQL

## Getting Started
Clone or download the repository to your computer. 
Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone https://github.com/Vishwas-Adiga/LibreHealthAtlas
$ npm install
```
Next, create a ClearDB database and fill the database credentials in index.js.

To deploy, run 
```sh
git add .
git commit -am 'Initial commit'
git push heroku master
```
(Refer to [deploying to heroku](https://heroku.com/deploy) for a detailed guide)

Go to the link provided by the Heroku CLI. That's it! You have your own version of LH Atlas up and running!

## Documentation
View the design documentation [here](https://docs.google.com/document/d/1OYRvTsoNGgy0ypW4iRug6dnnAL3O6IDfmpY7A-0lexQ/edit?usp=sharing)
View the REST API documentation [here](https://docs.google.com/document/d/1agIQlrpZ0oEXLB_CmmxdLb9lfu1HPDCTf00NNzlDqWo/edit?usp=sharing)