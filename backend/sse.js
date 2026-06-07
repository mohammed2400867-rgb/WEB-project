const clients = new Set();

function addClient(res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    res.write('data: {"type":"connected"}\n\n');

    clients.add(res);

    res.on('close', () => {
        clients.delete(res);
    });
}

function broadcast(event) {
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of clients) {
        try {
            client.write(payload);
        } catch (err) {
            clients.delete(client);
        }
    }
}

module.exports = { addClient, broadcast };
