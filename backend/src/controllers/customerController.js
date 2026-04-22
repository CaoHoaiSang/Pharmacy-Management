import Customer from "../models/Customer.js";

const generateCustomerCode = async () => {
    const customers = await Customer.find({
        customerId: { $regex: /^KH\d+$/ }
    }).select("customerId").lean();

    const maxCode = customers.reduce((max, customer) => {
        const numericPart = Number(customer.customerId.replace("KH", ""));
        return Number.isNaN(numericPart) ? max : Math.max(max, numericPart);
    }, 0);

    return `KH${String(maxCode + 1).padStart(3, "0")}`;
};

export const getAllCustomer = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        console.error("Lỗi khi gọi getAllCustomer", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const createCustomer = async (req, res) => {
    try {
        const { customerId, name, phone, email, address } = req.body;

        const newCustomer = new Customer({
            customerId: customerId?.trim() || await generateCustomerCode(),
            name,
            phone,
            email,
            address,
        });

        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (error) {
        console.error("Lỗi khi gọi createCustomer", error);
        res.status(400).json({ message: error.message || "Lỗi hệ thống" });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;

        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id,
            { name, phone, email, address },
            { new: true, runValidators: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: "Khách hàng không tồn tại" });
        }

        res.status(200).json(updatedCustomer);
    } catch (error) {
        console.error("Lỗi khi gọi updateCustomer", error);
        res.status(400).json({ message: error.message || "Lỗi hệ thống" });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);

        if (!deletedCustomer) {
            return res.status(404).json({ message: "Khách hàng không tồn tại" });
        }

        res.status(200).json({ message: "Khách hàng đã được xóa thành công" });
    } catch (error) {
        console.error("Lỗi khi gọi deleteCustomer", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
