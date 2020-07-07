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

app.get("/categoriasEquipo/get/:id", function (request, response) {
    var idequipo = request.params.id;
    var query = "select c.idCategoriaEquipo, c.nombre from categoriaequipo c INNER JOIN equipos e ON c.idCategoriaEquipo=e.idCategoriaEquipo WHERE e.idequipo=" + idequipo;
    conn.query(query, function (err, resultado) {
        if (err) {
            console.log(err);
        } else {
            response.json(resultado);
        }
    });
});

app.get("/categoriasEquipo/get/", function (request, response) {
    var query = "select * from categoriaequipo";
    conn.query(query, function (err, resultado) {
        if (err) {
            console.log(err);
        } else {
            response.json(resultado);
        }
    });
});

app.post("/categoriasEquipo/update", function(request,response){
    var idCategoriaEquipo = request.body.idCategoriaEquipo;
    var nombre = request.body.nombre;
    var query = "UPDATE categoriaequipo SET nombre = ? WHERE idCategoriaEquipo = ?";
    var parametros = [idCategoriaEquipo, nombre];
    var query2 = "SELECT * FROM categoriaequipo WHERE idCategoriaEquipo = " + idCategoriaEquipo;
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

app.post("/categoriasEquipo/create", function (request, response) {
    var nombreCategoriaEquipo = request.body.nombreCategoriaEquipo;
    var query = "INSERT INTO categoriaequipo (nombre) VALUES (?)";
    var parametros = [nombreCategoriaEquipo];
    conn.query(query, parametros, function (err, resultado) {
            if (err) {
                console.log(err);
            } else {
                var resultado = {
                    estado: "ok",
                    id: resultado.insertId,
                    nombre: parametros
                }
                response.json(resultado);
            }
        }
    );
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