import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
    {
        invoiceId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        invoiceDate: {
            type: Date,
            default: Date.now,
        },
        items: [
            {
                medicineId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Medicine",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                subtotal: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
