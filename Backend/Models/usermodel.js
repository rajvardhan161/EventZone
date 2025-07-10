import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {type: String,required: true,trim: true,},
  student_id: {type: String, required: true,unique: true, trim: true,},
  dob: {type: Date, required: true,},
  gender: {type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: true,
  },
  address: {type: String,required: true,trim: true,},
  phone_no: {type: String, required: true,trim: true,},
  email: {type: String,required: true,unique: true,lowercase: true,trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  course: {type: String,required: true,trim: true,},
  year_of_admission: {type: Number,required: true,},
  current_semester: {type: Number,required: true,min: 1,},
  password: {type: String,required: true,minlength: 6,},
  profile_photo: {type: String,default:"data:image/png;base64,iVBORw0KGgoAAAAN..."},
  isBlocked: {type: Boolean,default: false,},
  isEmailVerified: {type: Boolean,default: false,},
  isSubscribed: { type: Boolean, default: true }, 
  subscriptionToken: { type: String, unique: true, sparse: true },
  otp: {type: String,required: function() {
      return !this.isEmailVerified;
    }
  },
  otpExpiry: {type: Date,required: function() {
      return !this.isEmailVerified;
    }
  },
  lastOtpSentTime: {type: Date,required: function() {
      return !this.isEmailVerified;
    }
  },
  otpResendCount: {type: Number,default: 0,required: function() {
      return !this.isEmailVerified;
    }
  },
  enrollment_status: {type: String,
    enum: ['Enrolled', 'On Leave', 'Graduated', 'Withdrawn'],
    default: 'Enrolled',
  },
  major: {type: String,trim: true,},
  minor: {type: String,trim: true,},
  
  enrollment_date: {type: Date,default: Date.now,},
  emergency_contact_name: {type: String,trim: true,},
  emergency_contact_phone: {type: String,trim: true,},
  emergency_contact_relationship: {type: String,trim: true,},
  is_active: {type: Boolean,default: true,},
  roles: {type: [String],default: ['student'],},
  createdAt: {type: Date,default: Date.now,},
  updatedAt: {type: Date,default: Date.now,},
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const userModel = mongoose.models.user || mongoose.model('User',userSchema);

export default userModel;