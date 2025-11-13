module.exports = (sequelize, DataTypes) => {
    const SaleDetail = sequelize.define('SaleDetail', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        unitPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    });

    SaleDetail.associate = models => {
        SaleDetail.belongsTo(models.Product, {
            foreignKey: {
                allowNull: false
            }
        });
        SaleDetail.belongsTo(models.Sale, {
            foreignKey: {
                allowNull: false
            }
        });
    };

    return SaleDetail;
};