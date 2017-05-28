import {last} from 'lodash';
import * as mongoose from 'mongoose';
import  OKCoin from './okcoin-ws';

import {Ticker} from './models/ticker';
import {OrderBook} from './models/orderBook';

import {key, secret} from './secret'

const client = new OKCoin("cn", key, secret);

mongoose.connect('mongodb://localhost/okcoin')

interface SpotLine {
  0: number
  1: number
}

class Spot {

  asks: SpotLine[];
  bids: SpotLine[];

  constructor(rawSpot) {
    this.asks = rawSpot.asks.map(([price, vol]) => {
      return {price, vol}
    });

    this.bids = rawSpot.bids.map(([price, vol]) => {
      return {price, vol}
    })

  }

  gap(): number {
    const firstBid: number = this.bids[0][0];
    const lastAsk: number = last(this.asks)[0];
    return lastAsk - firstBid
  }

}

let lastPrice = 10000


client.subscribe({
  'ok_sub_spotcny_btc_depth_20': function (info) {
    console.log(info)
    const spot = new Spot(info);
    console.log(`gap`, spot.gap() / lastPrice, spot.gap());

    new OrderBook({timestamp: info.timestamp, asks: spot.asks, bids: spot.bids}).save()
  },
  'ok_sub_spotcny_btc_ticker': function (info) {
    console.log(`last`, info);
    lastPrice = Number(info.last)
    new Ticker(info).save()
  }
});


client.ws.on('open', function () {
  client.login()
})
