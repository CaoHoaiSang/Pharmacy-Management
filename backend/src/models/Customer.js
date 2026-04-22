import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
   {
    customerId: { type: String, required: true, unique: true, trim: true },
     name: { type: String, required: true, trim: true },
     phone: { type: String, required: true, trim: true },
     email: { type: String, required: true, trim: true },
     address: { type: String, required: true, trim: true }
   }, {timestamps: true}

)

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
