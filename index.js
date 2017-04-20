/**
 * Created by wang on 4/19/17.
 */

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}

handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/show"] = requestHandlers.show;
handle["/"] = requestHandlers.start;

server.start(router.route, handle);

function addPage(pageName){
    handle["/"+pageName] = requestHandlers.addNewPage;
}
