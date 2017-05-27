import {last} from 'lodash';

import  OKCoin from './okcoin-ws';

import {key, secret} from './secret'

const client = new OKCoin("cn", key, secret);

interface SpotLine {
  0: number
  1: number
}

class Spot {

  asks: SpotLine[];
  bids: SpotLine[];

  constructor(rawSpot) {
    this.asks = rawSpot.asks.map(([price, vol]) => {
      return [Number(price), Number(vol)]
    });

    this.bids = rawSpot.bids.map(([price, vol]) => {
      return [Number(price), Number(vol)]
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
    const spot = new Spot(info);
    console.log(`gap`, spot.gap()/lastPrice,spot.gap());
  },
  'ok_sub_spotcny_btc_ticker': function (info) {
    console.log(`last`, info.last);
    lastPrice = Number(info.last)
  }
});


client.ws.on('open',function(){
  client.login()
})
