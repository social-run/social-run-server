'use strict';

//Application Dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser');
const superagent = require('superagent');//making request from server to an api

//Application Set-up
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

//Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.log(err));

//Application Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

//API Endpoints
app.get('/api/v1/runs/', (req,res) => {
  client.query(`SELECT * FROM runs;`)
    .then(result => res.send(result.rows))
    .catch(console.error);
})

app.get('/api/v1/runs/:id', (req, res) => {
  client.query('SELECT * FROM runs WHERE run_id=$1;',
    [req.params.id])
    .then(results => {
      res.send(results.rows)
    })
    .catch(console.error);
});

app.get('/api/v1/runs/:id/votes', (req, res)=> {
  client.query('SELECT votes FROM runs WHERE run_id=$1',
  //results[0]+1
    [req.params.id])
    .then(results => {
      console.log(results.rows[0].votes);
      console.log(results.rows[0].votes,'results');
      res.send(`${results.rows[0].votes+1}`);
      console.log(results.rows[0].votes);
      client.query('UPDATE runs SET votes=$2 WHERE run_id=$1',
        [req.params.id,parseInt(results.rows[0].votes+1)])
    })
    .catch(console.error);
})

app.get('/admin',(req,res)=>{
  client.query('SELECT name FROM users WHERE name=$1',[req.headers.token])
    .then(results=>{
      console.log(results.rows[0].name,req.headers.token);
      if(results.rows[0].name===req.headers.token)
      {res.send(results.rows[0].name)}
      else{res.send('incorrect username')}
    })
    .catch(console.error)
})

app.put('/', (req, res) => {
  client.query('SELECT votes FROM runs WHERE run_id=$1',
    [req.params.id])
    .then(results => res.send(results.row))
    .catch(console.error);
});


app.get('/', (req, res) => res.redirect(CLIENT_URL));
app.get('*', (req, res) => res.send('error'));
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));