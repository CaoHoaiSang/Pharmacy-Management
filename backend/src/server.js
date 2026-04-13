import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import dns from 'dns';
dns.setServers(['1.1.1.1'],['8.8.8.8'])
import customerRouter from '../src/routes/customerRoutes.js'
import invoiceRouter from '../src/routes/invoiceRoutes.js'

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use("/Pharmacy-Management/Customer", customerRouter);
app.use("/Pharmacy-Management/Invoice", invoiceRouter)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
