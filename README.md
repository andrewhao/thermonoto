# thermonoto

IoT stats aggregator for environmental Raspberry Pi's

[![CircleCI](https://circleci.com/gh/andrewhao/thermonoto.svg?style=svg)](https://circleci.com/gh/andrewhao/thermonoto)

### Setting up Python DHT22/AM2302 temperature/humidity sensors

On the Raspberry Pi:

    $ cd ~/workspace/thermonoto/python
    $ pipenv install --three
    // Wait for install to finish
    $ pipenv run python thermonoto_make_reading.py
    // Should see some nice output

### Curl commands

    $ curl -X PUT -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -H "Postman-Token: 7bf4777b-9958-9c56-1b27-92f2584ed7f9" -d 'start_time=5:00AM&end_time=6:00AM' "http://localhost:5000/operating_hours"


