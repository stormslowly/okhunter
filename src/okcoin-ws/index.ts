import * as EventEmitter from 'events'
import * as WebSocket from 'ws'
import * as md5 from 'MD5'
import {setInterval} from "timers";
import Timer = NodeJS.Timer;


interface AddChannelEvent {event: 'addChannel',channel: string
}


export default class OKCoin {
  site: 'cn' | 'com';
  key: string;
  secret: string;
  ws: WebSocket;
  pingInterval: Timer;

  constructor(site: 'cn' | 'com', key: string, secret: string, channels?: any) {
    this.site = site
    this.key = key
    this.secret = secret

    if (channels) {
      this.subscribe(channels)
    }
  }

  subscribe(channels: any) {

    const socketURL = this.site === 'com'
      ? 'wss://real.okcoin.com:10440/websocket/okcoinapi'
      : 'wss://real.okcoin.cn:10440/websocket/okcoinapi';
    const ws = new WebSocket(socketURL);
    this.ws = ws;

    ws.on('open', () => {

      this.login()

      this.pingInterval = setInterval(() => {
        this.ping()
      }, 5000)


      const data: AddChannelEvent[] = [];
      Object.keys(channels).forEach(name => {
        switch (name) {
          case 'ok_spotusd_trade':
          case 'ok_spotusd_cancel_order':
          case 'ok_spotcny_trade':
          case 'ok_spotcny_cancel_order':
            // no need to subscribe one-time action channel, but need provide callback.
            break;
          case 'ok_usd_realtrades':
          case 'ok_cny_realtrades':
          case 'ok_usd_future_realtrades':
            this.addChannel(name);
            break;
          default:
            data.push({'event': 'addChannel', 'channel': name});
        }
      });

      ws.send(JSON.stringify(data));
    });

    ws.on('message', function (data) {

      const messages = JSON.parse(data);
      if (!Array.isArray(messages)) {
        return
      }

      messages.forEach(function (message) {
        let callback = channels[message['channel']];
        if (!callback) {
          console.warn('unregistered Message', JSON.stringify(message, null, ' '))
          return;
        }


        if (message['errorcode']) {
          message['errormessage'] = errorMessage(message['errorcode']);
          callback(null, message);
        }
        else if (message['data']) {
          callback(message['data']);
        }
      });
    });
  }

  private addChannel(channel: string, params?: any) {
    params = params ? params : {};
    params['api_key'] = this.key;
    params['sign'] = sign(params, this.secret);

    const data = {'event': 'addChannel', 'channel': channel, 'parameters': params};
    this.ws.send(JSON.stringify(data));
  }


  private ping() {
    this.ws.send(JSON.stringify({'event': 'ping'}))
  }


  /* Authorized methods */
  login() {
    const params = {api_key: this.key}
    params['sign'] = sign(params, this.secret);

    this.ws.send(JSON.stringify({event: "login", parameters: params}))
  }

  trade(symbol, type, price, amount: number) {
    const params = {'symbol': symbol, 'type': type, 'price': price, 'amount': amount};
    const channel = this.site === 'com' ? 'ok_spotusd_trade' : 'ok_spotcny_trade';
    this.addChannel(channel, params);
  }

  cancelOrder(symbol, orderId: string) {
    const params = {'symbol': symbol, 'order_id': orderId};
    const channel = this.site === 'com' ? 'ok_spotusd_cancel_order' : 'ok_spotcny_cancel_order';
    this.addChannel(channel, params);
  }

  futureTrade(params) {
    this.addChannel('ok_futuresusd_trade', params);
  }

  futureCancelOrder(params) {
    this.addChannel('ok_futuresusd_cancel_order', params);
  }

}


function sign(params, secret) {
  return md5(stringifyToOKCoinFormat(params) + '&secret_key=' + secret).toUpperCase();
}

/* snippet from OKCoin-API project */
function stringifyToOKCoinFormat(obj) {
  const arr: string[] = [];
  let formattedObject = '';

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      arr.push(key);
    }
  }
  arr.sort();
  for (let index = 0; index < arr.length; index++) {
    if (index != 0) {
      formattedObject += '&';
    }
    formattedObject += arr[index] + '=' + obj[arr[index]];
  }
  return formattedObject;
}


export const CODES_MAP = {
  10001: 'Illegal parameters',
  10002: 'Authentication failure',
  10003: 'This connection has requested other user data',
  10004: 'This connection did not request this user data',
  10005: 'System error',
  10009: 'Order does not exist',
  10010: 'Insufficient funds',
  10011: 'Order quantity too low',
  10012: 'Only support btc_usd ltc_usd',
  10014: 'Order price must be between 0 - 1,000,000',
  10015: 'Channel subscription temporally not available',
  10016: 'Insufficient coins',
  10017: 'WebSocket authorization error',
  10100: 'user frozen',
  10216: 'non-public API',
  20001: 'user does not exist',
  20002: 'user frozen',
  20003: 'frozen due to force liquidation',
  20004: 'future account frozen',
  20005: 'user future account does not exist',
  20006: 'required field can not be null',
  20007: 'illegal parameter',
  20008: 'future account fund balance is zero',
  20009: 'future contract status error',
  20010: 'risk rate information does not exist',
  20011: 'risk rate bigger than 90% before opening position',
  20012: 'risk rate bigger than 90% after opening position',
  20013: 'temporally no counter party price',
  20014: 'system error',
  20015: 'order does not exist',
  20016: 'liquidation quantity bigger than holding',
  20017: 'not authorized/illegal order ID',
  20018: 'order price higher than 105% or lower than 95% of the price of last minute',
  20019: 'IP restrained to access the resource',
  20020: 'secret key does not exist',
  20021: 'index information does not exist',
  20022: 'wrong API interface',
  20023: 'fixed margin user',
  20024: 'signature does not match',
  20025: 'leverage rate error'
}

function errorMessage(code) {
  if (!CODES_MAP[code]) {
    return 'OKCoin error code: ' + code + 'is not supported';
  }

  return CODES_MAP[code];
}

