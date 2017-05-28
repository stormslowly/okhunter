'use strict';
import * as mongoose  from 'mongoose';

const Schema = mongoose.Schema;

const TickerSchema = new Schema({
  high: {type: Number, required: true},
  vol: {type: Number, required: true},
  last: {type: Number, required: true},
  low: {type: Number, required: true},
  buy: {type: Number, required: true},
  sell: {type: Number, required: true},
  close: {type: Number, required: true},
  open: {type: Number, required: true},
  timestamp: {type: Date, required: true}
});

TickerSchema.index({timestamp:1});

export const Ticker = mongoose.model('Ticker', TickerSchema);



