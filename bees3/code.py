import time, os
import ipaddress
import wifi
import socketpool
import microcontroller
import neopixel
import board
import bees3
##import adafruit_rsa
from adafruit_httpserver import (
    Server,
    Request,
    FileResponse,
    JSONResponse,
    MIMETypes,
    GET,
    PUT,
    POST,
)
# Create a NeoPixel instance
# Brightness of 0.3 is ample for the 1515 sized LED
pixel = neopixel.NeoPixel(board.NEOPIXEL, 1, brightness=0.3,
    auto_write=True, pixel_order=neopixel.GRB)
# Create a colour wheel index int
color_index = 0
purple_index = 70
green_index = 160
orange_index = 242
# Turn on the power to the NeoPixel
bees3.set_pixel_power(True)

# set static IP
ipv4 = ipaddress.IPv4Address("10.80.8.42")
netmask = ipaddress.IPv4Address("255.255.255.0")
gateway = ipaddress.IPv4Address("10.80.8.1")
wifi.radio.set_ipv4_address(ipv4=ipv4, netmask=netmask, gateway=gateway)
# connect to SSID
wifi.radio.connect(os.getenv("WIFI_SSID"),
    os.getenv("WIFI_PASSWORD"))
pool = socketpool.SocketPool(wifi.radio)
server = Server(pool, "/static", debug=True)

@server.route("/api", [GET, PUT, POST], append_slash=True)
def api_handler(request: Request):
    """    Inspect a HTTP signature    """
    r,g,b = bees3.rgb_color_wheel(purple_index)
    pixel[0] = ( r, g, b, 0.5)

    if request.method in [POST, PUT]:
        r,g,b = bees3.rgb_color_wheel(green_index)
        pixel[0] = ( r, g, b, 0.5)
        js = request.json()
        loc,sig,inp = js.get("locator", ""), js.get("signature", ""), js.get("base-input", "")

        # TODO is rsa lib too cpu intensive?
        ##(public_key, private_key) = adafruit_rsa.newkeys(512)
        echo = {
            "locator": loc,
            "signature": sig,
            "base-input": inp,
        }
        r,g,b = bees3.rgb_color_wheel(orange_index)
        pixel[0] = ( r, g, b, 0.5)
        return JSONResponse(request, echo)

    # fall through (GET)
    return JSONResponse(request, [{"id": 1, "name": "Object 1"}])





@server.route("/cpu-info", append_slash=True)
def cpu_info_handler(request: Request):
    """
    Return the current CPU temp, freq, and voltage as json
    """
    data = {
        "temperature": microcontroller.cpu.temperature,
        "frequency": microcontroller.cpu.frequency,
        "voltage": microcontroller.cpu.voltage,
    }
    return JSONResponse(request, data)

@server.route("/")
def base(request: Request):
    """
    Serve the index.html file
    """
    return FileResponse(request, "index.html", "/www")

#print("httpd listening over wifi")
MIMETypes.configure(
    default_to="plain/text",
    keep_for=[".html", ".css", ".js", ".png", ".jpg"],
)
server.serve_forever(str(wifi.radio.ipv4_address))
