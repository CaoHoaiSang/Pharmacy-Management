import Customer from "../models/Customer.js";

export const getAllCustomer = async(req, res) => {
    try {
        const customer = await Customer.find().sort({createdAt: -1});
        res.status(201).json(customer); 
    } catch (error) {
        console.error("Lỗi khi gọi getAllCustomer", error);
        res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const createCustomer = async(req, res) => {
    try {
        const {customerId, name, phone, email, address} = req.body;
        const customer = new Customer({customerId, name, phone, email, address});

        const newCustomer = await customer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error("Lỗi khi gọi creatCustomer", error);
        res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const updateCustomer = async(req, res) => {
    try {
        const {name, phone, email, address} = req.body;
        const updateCustomer = await Customer.findOneAndUpdate(
            {customerId: req.params.customerId},
            {
                name,
                phone, 
                email,
                address
            },
            {new: true}
        );

        if(!updateCustomer){
            return res.status(401).json({message: "Khách hàng không tồn tại"})
        }
        res.status(200).json({message: "Khách hàng đã được cập nhật thành công"})
    } catch (error) {
         console.error("Lỗi khi gọi updateCustomer", error);
        res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const deleteCustomer = async(req, res) => {
    try {
        const deleteCustomer = await Customer.findOneAndDelete({customerId: req.params.customerId});
        if(!deleteCustomer){
             return res.status(401).json({message: "Khách hàng không tồn tại"})
        }
        
        res.status(200).json({message: "Khách hàng đã được xóa thành công"})

    } catch (error) {
         console.error("Lỗi khi gọi deleteCustomer", error);
        res.status(500).json({message: "Lỗi hệ thống"})
    }
}