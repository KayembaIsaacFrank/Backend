module.exports = (sequelize, DataTypes) => {
    const Sale = sequelize.define('Sale', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    });

    Sale.associate = models => {
        Sale.belongsTo(models.User, {
            foreignKey: {
                allowNull: false
            }
        });
        Sale.hasMany(models.SaleDetail);
    };

    return Sale;
};