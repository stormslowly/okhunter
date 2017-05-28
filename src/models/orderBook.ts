'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId

const Order = new Schema({price: Number, vol: Number}, {_id: false})


const OrderBookSchema = new Schema({

  bids: {type: [Order]},
  asks: {type: [Order]},

  timestamp: {type: Date, required: true}
});

OrderBookSchema.index({timestamp: 1});

export const OrderBook = mongoose.model('OrderBook', OrderBookSchema);

