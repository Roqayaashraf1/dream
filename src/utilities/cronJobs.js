import cron from 'node-cron';
import { orderModel } from '../../dataBase/models/order.model.js';

cron.schedule('* * * * *', async () => {
  try {
    const twoDaysAgo = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000));
    await orderModel.deleteMany({
      isPaid: 'PENDING',
      createdAt: { $lt: twoDaysAgo },
    });

    console.log('Old pending orders deleted successfully.');
  } catch (error) {
    console.error('Error deleting old pending orders:', error);
  }
});
