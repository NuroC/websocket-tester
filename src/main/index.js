var path = '~/websocket-tester';
var ws = null
var term = $('body').terminal({
    ws(type, _data) {
        if (!type) {
            this.echo(color('blue', JSON.stringify(ws, null, 2)));
        }
        if (type === 'close') {
            ws.close();
        } else if (type === 'open') {
            this.read("url:", (url) => {
                term.echo(color('yellow', "tring to connect to " + url));

                ws = new WebSocket(url);
                ws.onopen = function () {
                    term.echo('Connected to ' + url);
                }
                ws.send = new Proxy(ws.send, {
                    apply(target, thisArg, argumentsList) {
                        term.echo(color('green', ">> " + argumentsList[0]));
                        return target.apply(thisArg, argumentsList);
                    }
                });
                ws.onmessage = (e) => term.echo(color('red', "<< ") + e.data);

                ws.onclose = (e) => {
                    term.echo(color('red', "Connection closed: " + e.code));
                    ws = null;
                    console.log(e)
                }
                ws.onerror = function () {
                    term.echo(color('red', "socket error"));
                    ws = null;
                }
            });
        } else if (type === 'send') {
            this.read('message: ', (message) => {
                try {
                    ws.send(message);
                } catch (e) {
                    term.echo(color('red', "Error: ") + e.toString());
                }

            })
        }
    }

}, {
    greetings: false,
    name: 'websocket-tester',
    checkArity: false,
    prompt() {
        return `┌──(${color('green', 'guest@nuro.wtf')})-[${color('blue', path)}]
└─\$ `;
    }
});
$.terminal.syntax("javascript")
function color(name, string) {
    var colors = {
        blue: '#55f',
        green: '#4d4',
        grey: '#999',
        red: '#A00',
        yellow: '#FF5',
        violet: '#a320ce',
        white: '#fff'
    }
    if (colors[name]) {
        return '[[;' + colors[name] + ';]' + string + ']';
    } else {
        return string;
    }
}
