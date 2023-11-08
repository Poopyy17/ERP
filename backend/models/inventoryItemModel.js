import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema({
    name: String,
    category: String,
    quantity: Number,
  });
  
  const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
  
  export default InventoryItem;
