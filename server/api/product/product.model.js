'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

var ProductSchema = new Schema({
  name: String,
  description: String,
  price: Number,
  loyaltyPoints: Number,
  type: { type: String, uppercase: true },
  active: Boolean,
  image: String
});
ProductSchema
  .virtual('public_product')
  .get(function() {
    return {
      'id': this._id,
      'name': this.name,
      'description': this.description,
      'price': this.price,
      'loyaltyPoints': this.loyaltyPoints,
      'type':this.type,
      'image':this.image
    };
  });

ProductSchema.plugin(autoIncrement.plugin, 'Product');

module.exports = mongoose.model('Product', ProductSchema);
