/**
 * Created by wang on 4/19/17.
 */

function route(handle, pathname, response, request, postData) {
    if(pathname!='/favicon.ico'){
        var date = new Date();
        console.log(date.toISOString()+": About to route a request for " + pathname);
    }

    if (typeof handle[pathname] === 'function') {
        //console.log("post data is " + postData);
        handle[pathname](response, request, postData);
    } else {
        var date = new Date();
        console.log(date.toISOString()+": No request handler found for " + pathname);
        response.writeHead(404, {"Content-Type": "text/html"});
        response.write("404 Not found");
        response.end();
    }
}

exports.route = route;