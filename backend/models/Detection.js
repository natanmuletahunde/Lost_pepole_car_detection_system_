const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const detectionSchema = new mongoose.Schema({
  id:{
    type:Number,
    required:true,
    unique:true,
    default: () => parseInt(uuidv4().replace(/-/g, '').slice(0, 12), 16) % 1000000000000 
  },
  type:{
    type:String,
    required:true,
    enum:['Person','Car'],
    default:'Person'
  },
  registrationId:{
    type: mongoose.Schema.Types.ObjectId, // <-- MUST match Registration _id
    required:true,
    ref: 'Registration'
  },
  name:{
    type:String,
    required: function() { return this.type === 'Person'; },
    trim: true, 
    default: ''
  },
  licensePlate: { 
    type: String, 
    required: function() { return this.type === 'Car'; },
    trim: true, 
    uppercase: true, 
    default: ''
  },
  timestamp: { type: Date, required: true, default: Date.now },
  location: { type: String, required: true, trim: true },
  detectionImage: { type: String, required: true, trim: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  status: { type: String, required: true, enum: ['Pending', 'Confirmed', 'False'], default: 'Pending' },
  priority: { type: String, required: true, enum: ['High', 'Normal'], default: 'Normal' },
  behavior: { type: String, required: true, default: 'Normal' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Detection', detectionSchema);
