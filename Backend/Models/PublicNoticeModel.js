import mongoose from "mongoose";

const Schema = mongoose.Schema;

const publicNoticeSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Notice message is required'],
    trim: true,
  },
  link: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^(https?:\/\/|www\.)[^\s]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    },
    default: null
  },
  linkText: {
    type: String,
    trim: true,
    default: null
  },
  sentByAdminId: {
    type: String, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true
});

publicNoticeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PublicNoticeModel = mongoose.models.PublicNotice || mongoose.model('PublicNotice', publicNoticeSchema);

export default PublicNoticeModel;
