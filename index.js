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


//*****************PARTE 3********************//
app.post("/sitios/create", express.json(), function (req, res) {


    var query = "insert into sitios (codigoSitio, idCentroPoblado, latitud, longitud) values (?,?,?,?)";
    var parametros = [req.body.codigoSitio, req.body.idCentroPoblado, req.body.latitud, req.body.longitud];
    conn.query(query, parametros, function (err1, resultado1) {
        if (err1) {
            console.log(err1);
            res.send("No se pudo crear. Revisar los tipos de dato, que los datos esten completos y que el id de centro sea existente.");
        } else {

            var query2 = "SELECT * FROM sitios s \n" +
                "inner join centrospoblados c on s.idCentroPoblado= c.idCentroPoblado\n" +
                "where s.idSitio=?";
            var parametros2 = [resultado1.insertId];
            conn.query(query2, parametros2, function (err2, resultado2) {
                if (err2) {
                    res.send("Error de base de datos");
                } else {
                    var text = `{"codigoSitio": "${resultado2[0].codigoSitio}" ,
                                "idCentroPoblado": ${resultado2[0].idCentroPoblado} ,
                                "latitud": ${resultado2[0].latitud} ,
                                "longitud": ${resultado2[0].longitud} ,
                                "idSitio": ${resultado2[0].idSitio},
                                "nombreCentroPoblado": "${resultado2[0].nombreCentroPoblado}" }`;
                    var jsonString = JSON.parse(text);
                    res.json(jsonString);
                }
            });
        }
    });
});

app.post("/equipos/create", express.json(), function (req, res) {


    var query = "insert into equipos (nombreEquipo, idCategoriaEquipo, serialNumber, modelo,idSitio) values (?,?,?,?,?)";
    var parametros = [req.body.nombreEquipo, req.body.idCategoriaEquipo, req.body.serialNumber, req.body.modelo, req.body.idSitio];
    conn.query(query, parametros, function (err1, resultado1) {
        if (err1) {
            console.log(err1);
            res.send("No se pudo crear. Revisar los tipos de dato, que los datos esten completos y que los id de categoria y sitio sean existentes.");
        } else {
            var text = `{"idequipo": ${resultado1.insertId} ,
                                "nombreEquipo": "${req.body.nombreEquipo}" ,
                                "idCategoriaEquipo": ${req.body.idCategoriaEquipo},
                                "serialNumber": "${req.body.serialNumber}",
                                "modelo": "${req.body.modelo}",
                                "idSitio": ${req.body.idSitio} }`;
            var jsonString = JSON.parse(text);
            res.json(jsonString);


        }
    });
});
app.get("/sitios/get", function (request, response) {
    var query = "SELECT s.*,c.nombreCentroPoblado,count(e.idEquipo) as \"cantidadEquipos\" FROM sitios s \n" +
        "inner join centrospoblados c on s.idCentroPoblado= c.idCentroPoblado\n" +
        "left join equipos e on s.idSitio= e.idSitio\n" +
        "group by s.idSitio;";
    conn.query(query, function (err, resultado) {
        if (err) {
            console.log(err);
        } else {
            response.json(resultado);
        }
    });
});

app.get("/sitios/get/:id", function (request, response) {
    var id = request.params.id;
    var query = "SELECT s.*,c.nombreCentroPoblado,count(e.idEquipo) as \"cantidadEquipos\" FROM sitios s\n" +
        "        inner join centrospoblados c on s.idCentroPoblado= c.idCentroPoblado\n" +
        "        left join equipos e on s.idSitio= e.idSitio\n" +
        "        where s.idSitio=? " +
        "        group by s.idSitio;";
    var parametros = [id];
    conn.query(query, parametros, function (err, resultado1) {
        if (err) {
            console.log(err);
        } else {
            if (Object.keys(resultado1).length === 0) {
                response.send("No existe el id");
            } else {
                var query2 = "SELECT * FROM equipos where idSitio =?";
                conn.query(query2, parametros, function (err, resultado2) {
                    var equipos;
                    if (err) {
                        response.send("Error de base de datos");
                    } else {
                        equipos = JSON.stringify(resultado2);
                        var text = `{"codigoSitio": "${resultado1[0].codigoSitio}" ,
                                "idCentroPoblado": ${resultado1[0].idCentroPoblado} ,
                                "latitud": ${resultado1[0].latitud} ,
                                "longitud": ${resultado1[0].longitud} ,
                                "idSitio": ${resultado1[0].idSitio},
                                "nombreCentroPoblado": "${resultado1[0].nombreCentroPoblado}",
                                "cantidadEquipos": ${resultado1[0].cantidadEquipos},
                                "equipos": ${equipos} }`;
                        var jsonString = JSON.parse(text);
                        response.json(jsonString);
                    }

                });
            }
        }
    });
});