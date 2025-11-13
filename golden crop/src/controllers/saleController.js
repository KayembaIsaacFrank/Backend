const { Sale, SaleDetail, Product } = require('../models');

exports.createSale = async (req, res) => {
    try {
        const { userId, products } = req.body; // products is an array of { productId, quantity }
        let totalAmount = 0;

        for (const p of products) {
            const product = await Product.findByPk(p.productId);
            if (!product || product.quantity < p.quantity) {
                return res.status(400).json({ error: `Product ${p.productId} not available in sufficient quantity` });
            }
            totalAmount += product.price * p.quantity;
        }

        const sale = await Sale.create({ totalAmount, UserId: userId });

        for (const p of products) {
            const product = await Product.findByPk(p.productId);
            await SaleDetail.create({
                SaleId: sale.id,
                ProductId: p.productId,
                quantity: p.quantity,
                unitPrice: product.price
            });
            product.quantity -= p.quantity;
            await product.save();
        }

        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};