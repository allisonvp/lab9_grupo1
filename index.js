'use strict'

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

var app = express();
app.use(bodyParser.urlencoded({extended: true}));

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "inventariotest"
});

conn.connect(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Conexión exitosa a base de datos");
    }
});
app.listen(8080, function () {
    console.log("Servidor levantado exitosamente");
});


//localhost:8080/centrospoblados/get
app.get("/centrospoblados/get", function(request,response){
    var query = "SELECT * FROM inventariotest.centrospoblados";
    conn.query(query, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            response.json(result);
        }
    })
});

//localhost:8080/centrospoblados/get/{id}
app.get("/centrospoblados/get/:id", function(request,response){
    var idCP = request.params.id;
    var query = "SELECT * FROM inventariotest.centrospoblados WHERE idCentroPoblado = " + idCP;
    conn.query(query, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            response.json(result);
        }
    })
});

//localhost:8080/centrospoblados/create
app.post("/centrospoblados/create", function(request,response){
    var nombreCentroPoblado = request.body.nombreCentroPoblado;
    var ubigeo = request.body.ubigeo;
    var query = "INSERT INTO inventariotest.centrospoblados (nombreCentroPoblado, ubigeo) VALUES (?,?)";
    var parametros = [nombreCentroPoblado, ubigeo];
    var query2= "SELECT * FROM inventariotest.centrospoblados ORDER BY idCentroPoblado DESC LIMIT 1";
    conn.query(query, parametros,function (err, result) {
        if (err) {
            console.log(err);
        } else {
            var jsonRespuesta = {idCentroPoblado: result.insertId,nombreCentroPoblado: nombreCentroPoblado, ubigeo: ubigeo};
            response.json(jsonRespuesta);
        }
    })
});

//localhost:8080/centrospoblados/update
app.post("/centrospoblados/update", function(request,response){
    var idCentroPoblado = request.body.idCentroPoblado;
    var nombreCentroPoblado = request.body.nombreCentroPoblado;
    var ubigeo = request.body.ubigeo;
    var query = "UPDATE inventariotest.centrospoblados SET nombreCentroPoblado = ?, ubigeo = ? WHERE idCentroPoblado = ?";
    var parametros = [nombreCentroPoblado, ubigeo,idCentroPoblado];
    var query2 = "SELECT * FROM inventariotest.centrospoblados WHERE idCentroPoblado = " + idCentroPoblado;
    conn.query(query,parametros, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            conn.query(query2,function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    response.json(result);
                }
            })
        }
    })
});