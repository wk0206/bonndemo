/**
 * Created by wang on 4/19/17.
 */

var fs = require("fs");
var traverse = require('traverse');
var parser = require('xml2json');
var formidable = require("formidable");
var sync = require('synchronize');




function start(response) {
    console.log("Request handler 'start' was called.");
    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="Content-Type" content="text/html; '+
        'charset=UTF-8" />'+
        '</head>'+
        '<body>'+
        '<label>This is the first page</label><br/>'+
        '<label>For upload xlsx file</label><br/>'+
        '<label>After upload , click upload</label><br/>'+
        '<form action="/upload" enctype="multipart/form-data" '+
        'method="post">'+
        '<input type="file" name="upload" multiple="multiple">'+
        '<input type="submit" value="for test xml input" />'+
        '</form>'+
        '<br/>'+
        '<hr>'+
        '<script type="text/javascript">'+
        'if (window.File && window.FileReader && window.FileList && window.Blob) {'+
        '/*alert(\'support\')*/'+
        '} else {'+
        'alert(\'The File APIs are not fully supported in this browser.\');'+
        '}</script>'+
        '<form action="/upload" enctype="multipart/form-data" '+
        'method="post">'+
        '<input type="file" id="files" name="files[]" multiple="multiple" hidden>'+
        '<output id="list"></output>'+
        '<input type="submit" value="for test link jump" />'+
        '</form>'+
        '</body>'+
        '</html>';
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request) {
    console.log("Request handler 'upload' was called.");
    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(request, function(error, fields, files) {
        console.log("parsing done");
        fs.renameSync(files.upload.path, "/tmp/test.xml");
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("received data:<br/>");
        response.write("<a href='/showxml2json'>show xml2json</a>");
        response.write("<br/>");
        response.end();
    });
}

function readFiles(dirname, onFileContent, onError){
    fs.readdir(dirname,function(err,filenames) {
        if(err){
            onError(err);
            return;
        }
        filenames.forEach(function(filename) {
            fs.readFile(dirname+filename,'utf-8', function(err, content){
                if(err){
                    onError(err);
                    return;
                }
                onFileContent(filename,content);
            });
        });
    });
}

function show(response) {
    console.log("Request handler 'show' was called.");
    fs.readFile("/tmp/test.xml", "binary", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            var json = parser.toJson(file); //returns a string containing the JSON structure by default
            var leaves = traverse(json).reduce(function (acc, x) {
                if (this.isLeaf) acc.push(x);
                return acc;
            }, []);
//console.dir(leaves);
            response.write(json);
            response.end();
        }
    });
}

function showxml2json(response,request,postData) {
    console.log("Request handler 'show' was called.");
    fs.readFile("/tmp/test.xml", "binary", function(error, file) {
        if(error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "text/html"});
            console.log("trasform from xml to JSON: start");
            var json = parser.toJson(file); //returns a string containing the JSON structure by default
            console.log("trasform from xml to JSON: end");
            //console.log(json);
            var leaves = traverse(json).reduce(function (acc, x) {
                if (this.isLeaf) acc.push(x);
                return acc;
            }, []);
            var treatJS = treatJson(json);

            var splithtml = json.split(/{/);
            var replace1 = json.replace(/{/g,"<td>");
            var replace2 = replace1.replace(/}/g,"</td>");
            //var replace2 = replace1.replace(/,/g,",<br/>");
            //var splithtml = json.split(/\".*\"{1}/g);
            var res = '';
            for (var i = 0; i < splithtml.length ; i ++){
                if(splithtml[i].indexOf("}")>0){
                    var temp ="<br/>node:{"+splithtml[i].replace("}","");
                    var temp2 = temp.substring(5);
                    var temp3 = temp2.split(",");
                    res+=(temp+"<br/>");
                    for (var j = 0; j < temp3.length ; j ++){
                        //res+=("<br/>    preoperties:"+temp3[j]);
                    }
                }
            }
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write("received data:<br/>");
            var func =
                '<script type="text/javascript">'+
                'function showButton(id){' +
                '   if(document.getElementById(id).style.display=="block"){' +
                '       document.getElementById(id).style.display="none"' +
                '   } else {' +
                '       document.getElementById(id).style.display="block";' +
                '   }'+
                '}'+
                '</script>';

            response.write(func);
            for (var i = 0 ; i<treatJS.length; i ++){
                response.write("<input type = 'button' onclick='showButton(\"toc"+i+"\")' value = data"+i+">");
                response.write("<div id=\"toc"+i+"\" hidden>");
                response.write("<table style=\"width:100%\">");
                for (var j = 0; j < treatJS[i].length; j++){
                    //response.write(treatJS[i][j].datablock+"<br/>");
                    //console.log("treatJS["+i+"]["+j+"]"+treatJS[i][j].datablock);
                    //var htmlLine = JSONtoCSV(treatJS[i][j]);
                    var htmlLine = JSONtoHTML(treatJS[i][j]);
                    response.write(htmlLine);
                }
                response.write("</table>");
                response.write("</div>");
                response.write("<br/>");
            }
            //response.write("<img src='/show' />");
            //response.write("<lable>test</lable>")
            response.end();
        }
    });

}

exports.start = start;
exports.upload = upload;
exports.show = show;