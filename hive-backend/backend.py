# @author: lukasz.lalik@zadane.pl 

import json
from httplib2 import Http
import BaseHTTPServer
from BaseHTTPServer import *

# Users will be used for a very basic authorization:
# Whenever a user authorizes, well check whether his chosen nickname is available.
# If it is available, well grant him permisson to use the chat under that nickname,
# and if it isn't available, we won't grant him any permission.
users = []
players = {} 
h = Http()

class BackendHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
	if self.path == "/player_new":
		(length,) = self.headers["Content-Length"],
		state = json.loads(self.rfile.read(int(length)))
		trigger = state["trigger"]["args"][0]
		sid = state["sid"]

		player = {}
		player["name"] = trigger["name"]
		player["color"] = trigger["color"]
		player["x"] = int(trigger["x"])
		player["y"] = int(trigger["y"])

		reply = [{"action" : "reply",
			"args" : {"name" : "player.all",
			"args" : [players.values()]}}]

		reply = json.dumps(reply)
		self._reply(200, reply)
		
			
                action = {"name" : "player.update",
                          "args" : [player]}
		h.request("http://localhost:9000/api/dev123123/pubsub/publish/player.all" ,
                          "POST", json.dumps(action))
		h.request("http://localhost:9000/api/dev123123/pubsub/subscribe/" + sid,
                          "POST", json.dumps(["player.all"]))

		players[sid] = player
		return

	if self.path == "/player_move":
		(length,) = self.headers["Content-Length"],
		state = json.loads(self.rfile.read(int(length)))
		trigger = state["trigger"]["args"][0]
		sid = state["sid"]

		player = players[sid]
		player["x"] = int(trigger["x"])
		player["y"] = int(trigger["y"])
		
		self._reply(200, [])

                actions = {"name" : "player.update",
                           "args" : [player]}
                h.request("http://localhost:9000/api/dev123123/pubsub/publish/player.all",
                          "POST", json.dumps(actions))
		return

        if self.path == "/cleanup":
		return
            # This is just a convenience API to make the nickname available again.
            #(length,) = self.headers["Content-Length"],
            #state = json.loads(self.rfile.read(int(length)))
            #nick = state["state"]["nick"]
            #users.remove(nick)
            #self._reply(200, "")
            #return

        else:
            # A bad API call. Well damn.
            self.send_response(404)
            self.wfile.write(json.dumps({"error" : "bad_request", "description" : "Unhandled endpoint!"}))
            return

    def _reply(self, code, reply):
        self.send_response(code)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(reply)
        return
    
    def _leave(self, nick, rooms):
        for c in rooms:
            channel = "rooms." + c
            actions = [{"action" : "reply",
                        "args" : {"name" : "dude_leaves",
                                  "args" : [{"channel" : channel,
                                             "nick" : nick}]}}]
            h.request("http://localhost:1235/api/abcde12345/pubsub/publish/" + channel,
                      "POST",
                      json.dumps(actions))

httpd = BaseHTTPServer.HTTPServer(('127.0.0.1', 8081), BackendHTTPRequestHandler)
sa = httpd.socket.getsockname()

print "Serving HTTP on", sa[0], "port", sa[1], "..."
httpd.serve_forever()
