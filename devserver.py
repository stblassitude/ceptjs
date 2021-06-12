#!/usr/bin/env python3

import aiohttp
import asyncio

from aiohttp import web

routes = web.RouteTableDef()

# @routes.get('/')
# async def hello(request):
#     return web.Response(text="Hello, world")


@routes.get('/btxws')
async def websocket_handler(request):

    ws = web.WebSocketResponse()
    await ws.prepare(request)
    print('opening connection')
    reader, writer = await asyncio.open_connection(
        '195.201.94.166', 20000)

    async def server_to_websocket():
        while True:
            try:
                data = await reader.read(64)
                if not data:
                    print('socket connection closed')
                    break
                await ws.send_bytes(data)
            except ConnectionError:
                await ws.close()
                break

    task = asyncio.get_event_loop().create_task(server_to_websocket())

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.BINARY:
            try:
                writer.write(msg.data)
                await writer.drain()
            except ConnectionError:
                await ws.close()
                writer.close()
        elif msg.type == aiohttp.WSMsgType.ERROR:
            if task:
                task.cancel()
                task = None
            writer.close()
            print('ws connection closed with exception %s' %
                  ws.exception())

    writer.close()

    return ws


app = web.Application()

app.add_routes([web.static('/web', './', show_index=True)])
app.add_routes(routes)

web.run_app(app)
