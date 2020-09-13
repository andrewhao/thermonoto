#!/usr/bin/python
import adafruit_dht
import board
import requests
import os

sensor = adafruit_dht.DHT22(board.D4)

MAX_TRIES = 3

# Try to grab a sensor reading.  Use the read_retry method which will retry up
# to 15 times to get a sensor reading (waiting 2 seconds between each retry).
while (tries < MAX_TRIES):
    try:
        humidity = sensor.humidity
        temperature = sensor.temperature
    except RuntimeError as error:
        # Errors happen fairly often, DHT's are hard to read, just keep going
        print(error.args[0])
        time.sleep(2.0)
        tries += 1
        continue
    except Exception as error:
        dhtDevice.exit()
        raise error

temperature = temperature * 9/5.0 + 32

data = dict(temperature=temperature, humidity=humidity, device_id=os.environ['HOSTNAME'])

response = requests.post('http://thermonoto.herokuapp.com/temperature_updates', data=data)
print('Posting with', data)
print(response)

# Note that sometimes you won't get a reading and
# the results will be null (because Linux can't
# guarantee the timing of calls to read the sensor).
# If this happens try again!
if humidity is not None and temperature is not None:
    print('Temp={0:0.1f}*F  Humidity={1:0.1f}%'.format(temperature, humidity))
else:
    print('Failed to get reading. Try again!')
