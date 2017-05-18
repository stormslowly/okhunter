import * as OKCoin from 'okcoin-ws';
import {last} from 'lodash';
// const OKCoin = require('okcoin-ws');

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


client.subscribe({
  'ok_sub_spotcny_btc_depth_20': function (info) {
    console.log(`asks:\n`, info.asks);
    console.log(`bids:\n`, info.bids);
    const spot = new Spot(info);
    console.log(`gap`, spot.gap());

  }
});

