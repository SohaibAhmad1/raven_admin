import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Simple admin authentication (for demo purposes)
const ADMIN_EMAIL = 'admin@deliveryhub.com';
const ADMIN_PASSWORD = 'admin123';

// Helper to generate mock data
function generateMockData() {
  return {
    stats: {
      totalDeliveries: 1247,
      totalUsers: 842,
      activeRiders: 156,
      totalEarnings: 24580,
      successRate: 98,
      avgDeliveryTime: 28,
      recentDeliveries: [
        { id: '1001', route: 'Downtown → Suburban A', status: 'delivered', time: '2 mins ago' },
        { id: '1002', route: 'Mall → Residential B', status: 'in-transit', time: '8 mins ago' },
        { id: '1003', route: 'Airport → Downtown', status: 'picked-up', time: '12 mins ago' },
      ],
      topRiders: [
        { name: 'John Smith', deliveries: 142, rating: '4.9', earnings: 2840 },
        { name: 'Sarah Johnson', deliveries: 138, rating: '4.8', earnings: 2760 },
        { name: 'Mike Wilson', deliveries: 125, rating: '4.7', earnings: 2500 },
      ],
    },
    users: [
      { id: '1', name: 'Alice Brown', email: 'alice@example.com', phone: '+1-555-0101', totalOrders: 24, status: 'active', joinedDate: '2024-01-15', totalSpent: 480, recentOrders: [] },
      { id: '2', name: 'Bob Chen', email: 'bob@example.com', phone: '+1-555-0102', totalOrders: 18, status: 'active', joinedDate: '2024-02-20', totalSpent: 360, recentOrders: [] },
      { id: '3', name: 'Carol Davis', email: 'carol@example.com', phone: '+1-555-0103', totalOrders: 31, status: 'active', joinedDate: '2024-01-05', totalSpent: 620, recentOrders: [] },
    ],
    riders: [
      { id: '1', name: 'John Smith', email: 'john@example.com', phone: '+1-555-0201', vehicle: 'Motorcycle', licensePlate: 'ABC-123', totalDeliveries: 142, rating: '4.9', earnings: '2840', status: 'active', complaints: 2, recentDeliveries: [] },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1-555-0202', vehicle: 'Car', licensePlate: 'DEF-456', totalDeliveries: 138, rating: '4.8', earnings: '2760', status: 'active', complaints: 1, recentDeliveries: [] },
      { id: '3', name: 'Mike Wilson', email: 'mike@example.com', phone: '+1-555-0203', vehicle: 'Van', licensePlate: 'GHI-789', totalDeliveries: 125, rating: '4.7', earnings: '2500', status: 'pending', complaints: 0, recentDeliveries: [] },
    ],
    deliveries: [
      { id: '1001', customerName: 'Alice Brown', riderName: 'John Smith', pickupAddress: '123 Main St', dropoffAddress: '456 Oak Ave', amount: '18.50', status: 'delivered', time: '2 mins ago', category: 'Food', weight: '2.5', distance: '5.2', paymentMethod: 'Credit Card' },
      { id: '1002', customerName: 'Bob Chen', riderName: 'Sarah Johnson', pickupAddress: 'Mall Complex', dropoffAddress: '789 Pine Rd', amount: '22.00', status: 'in-transit', time: '8 mins ago', category: 'Electronics', weight: '1.8', distance: '7.5', paymentMethod: 'Cash' },
      { id: '1003', customerName: 'Carol Davis', riderName: null, pickupAddress: 'Airport Terminal', dropoffAddress: 'Downtown Plaza', amount: '35.00', status: 'pending', time: '12 mins ago', category: 'Documents', weight: '0.5', distance: '12.3', paymentMethod: 'Credit Card' },
    ],
    payments: [
      { id: '1', customerName: 'Alice Brown', deliveryId: '1001', amount: '18.50', method: 'Credit Card', status: 'completed', date: '2024-11-15' },
      { id: '2', customerName: 'Bob Chen', deliveryId: '1002', amount: '22.00', method: 'Cash', status: 'completed', date: '2024-11-15' },
    ],
    payouts: [
      { id: '1', riderName: 'John Smith', deliveryCount: 28, grossAmount: '560.00', commission: '84.00', amount: '476.00', status: 'pending', date: '2024-11-15' },
      { id: '2', riderName: 'Sarah Johnson', deliveryCount: 25, grossAmount: '500.00', commission: '75.00', amount: '425.00', status: 'completed', date: '2024-11-10' },
    ],
    promos: [
      { id: '1', code: 'WELCOME20', type: 'percentage', value: '20', minOrder: '15', maxDiscount: '10', usageLimit: '100', usageCount: 45, expiryDate: '2024-12-31', description: 'Welcome offer for new users', status: 'active', totalSavings: 234 },
      { id: '2', code: 'SAVE5', type: 'fixed', value: '5', minOrder: '20', maxDiscount: '', usageLimit: '', usageCount: 128, expiryDate: '', description: 'Save $5 on orders above $20', status: 'active', totalSavings: 640 },
    ],
    disputes: [
      { id: '1', type: 'Lost Parcel', deliveryId: '998', filedBy: 'User: Alice Brown', reason: 'Package never arrived', description: 'I never received my package even though it shows delivered.', amount: '25.00', status: 'pending', date: '2024-11-14', evidence: 'Photo of empty doorstep' },
      { id: '2', type: 'Damaged Item', deliveryId: '997', filedBy: 'User: Bob Chen', reason: 'Item was damaged during delivery', description: 'The box was crushed and the item inside was broken.', amount: '45.00', status: 'resolved', date: '2024-11-12', refundAmount: 45, resolutionNotes: 'Full refund issued' },
    ],
  };
}

// Routes

// Auth
app.post('/make-server-d5a6a6f2/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = 'admin-token-' + Date.now();
      
      return c.json({
        token,
        user: {
          email: ADMIN_EMAIL,
          role: 'admin',
        },
      });
    }
    
    return c.json({ error: 'Invalid credentials' }, 401);
  } catch (err: any) {
    console.log('Login error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Dashboard Stats
app.get('/make-server-d5a6a6f2/dashboard/stats', async (c) => {
  try {
    const mockData = generateMockData();
    return c.json(mockData.stats);
  } catch (err: any) {
    console.log('Error fetching dashboard stats:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Users
app.get('/make-server-d5a6a6f2/users', async (c) => {
  try {
    const mockData = generateMockData();
    return c.json({ users: mockData.users });
  } catch (err: any) {
    console.log('Error fetching users:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.get('/make-server-d5a6a6f2/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const mockData = generateMockData();
    const user = mockData.users.find(u => u.id === id);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({
      ...user,
      recentOrders: [
        { id: '1001', date: '2024-11-15', amount: '18.50', status: 'delivered' },
        { id: '1002', date: '2024-11-14', amount: '22.00', status: 'delivered' },
      ],
    });
  } catch (err: any) {
    console.log('Error fetching user:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.put('/make-server-d5a6a6f2/users/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    console.log(`Updated user ${id} status to ${status}`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error updating user status:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Riders
app.get('/make-server-d5a6a6f2/riders', async (c) => {
  try {
    const mockData = generateMockData();
    return c.json({ riders: mockData.riders });
  } catch (err: any) {
    console.log('Error fetching riders:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.get('/make-server-d5a6a6f2/riders/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const mockData = generateMockData();
    const rider = mockData.riders.find(r => r.id === id);
    
    if (!rider) {
      return c.json({ error: 'Rider not found' }, 404);
    }
    
    return c.json({
      ...rider,
      recentDeliveries: [
        { id: '1001', route: 'Downtown → Suburban A', amount: '18.50', date: '2024-11-15' },
        { id: '1002', route: 'Mall → Residential B', amount: '22.00', date: '2024-11-15' },
      ],
    });
  } catch (err: any) {
    console.log('Error fetching rider:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.put('/make-server-d5a6a6f2/riders/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    console.log(`Updated rider ${id} status to ${status}`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error updating rider status:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Deliveries
app.get('/make-server-d5a6a6f2/deliveries', async (c) => {
  try {
    const mockData = generateMockData();
    return c.json({ deliveries: mockData.deliveries });
  } catch (err: any) {
    console.log('Error fetching deliveries:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.get('/make-server-d5a6a6f2/deliveries/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const mockData = generateMockData();
    const delivery = mockData.deliveries.find(d => d.id === id);
    
    if (!delivery) {
      return c.json({ error: 'Delivery not found' }, 404);
    }
    
    return c.json(delivery);
  } catch (err: any) {
    console.log('Error fetching delivery:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.put('/make-server-d5a6a6f2/deliveries/:id/reassign', async (c) => {
  try {
    const id = c.req.param('id');
    const { riderId } = await c.req.json();
    
    console.log(`Reassigned delivery ${id} to rider ${riderId}`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error reassigning delivery:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Pricing
app.get('/make-server-d5a6a6f2/pricing', async (c) => {
  try {
    const pricing = await kv.get('pricing_settings');
    
    if (!pricing) {
      return c.json({
        baseFare: '5.00',
        perKmRate: '1.50',
        serviceRadius: '25',
        surgeEnabled: false,
        surgePeakHours: '18:00-20:00',
        surgeMultiplier: '1.5',
      });
    }
    
    return c.json(pricing);
  } catch (err: any) {
    console.log('Error fetching pricing:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.put('/make-server-d5a6a6f2/pricing', async (c) => {
  try {
    const pricingData = await c.req.json();
    await kv.set('pricing_settings', pricingData);
    
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error updating pricing:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Payments & Commissions
app.get('/make-server-d5a6a6f2/payments', async (c) => {
  try {
    const mockData = generateMockData();
    return c.json({ payments: mockData.payments });
  } catch (err: any) {
    console.log('Error fetching payments:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.get('/make-server-d5a6a6f2/payouts', async (c) => {
  try {
    const mockData = generateMockData();
    return c.json({ payouts: mockData.payouts });
  } catch (err: any) {
    console.log('Error fetching payouts:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.get('/make-server-d5a6a6f2/commission-settings', async (c) => {
  try {
    const settings = await kv.get('commission_settings');
    return c.json(settings || { commissionRate: '15' });
  } catch (err: any) {
    console.log('Error fetching commission settings:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.put('/make-server-d5a6a6f2/commission-settings', async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set('commission_settings', settings);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error updating commission settings:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.post('/make-server-d5a6a6f2/payouts/:id/process', async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`Processed payout ${id}`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error processing payout:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Analytics
app.get('/make-server-d5a6a6f2/analytics', async (c) => {
  try {
    return c.json({
      deliveryTrends: [],
      zoneDistribution: [],
    });
  } catch (err: any) {
    console.log('Error fetching analytics:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Promos
app.get('/make-server-d5a6a6f2/promos', async (c) => {
  try {
    const mockData = generateMockData();
    return c.json({ promos: mockData.promos });
  } catch (err: any) {
    console.log('Error fetching promos:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.post('/make-server-d5a6a6f2/promos', async (c) => {
  try {
    const promoData = await c.req.json();
    console.log('Created promo:', promoData);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error creating promo:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.put('/make-server-d5a6a6f2/promos/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const promoData = await c.req.json();
    console.log(`Updated promo ${id}:`, promoData);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error updating promo:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/make-server-d5a6a6f2/promos/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`Deleted promo ${id}`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error deleting promo:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Disputes
app.get('/make-server-d5a6a6f2/disputes', async (c) => {
  try {
    const mockData = generateMockData();
    return c.json({ disputes: mockData.disputes });
  } catch (err: any) {
    console.log('Error fetching disputes:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.post('/make-server-d5a6a6f2/disputes/:id/resolve', async (c) => {
  try {
    const id = c.req.param('id');
    const { action, resolution, refundAmount } = await c.req.json();
    
    console.log(`Resolved dispute ${id} with action ${action}, refund: ${refundAmount}`);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error resolving dispute:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Settings
app.get('/make-server-d5a6a6f2/settings', async (c) => {
  try {
    const settings = await kv.get('system_settings');
    return c.json(settings || {});
  } catch (err: any) {
    console.log('Error fetching settings:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.put('/make-server-d5a6a6f2/settings', async (c) => {
  try {
    const settingsData = await c.req.json();
    await kv.set('system_settings', settingsData);
    return c.json({ success: true });
  } catch (err: any) {
    console.log('Error updating settings:', err);
    return c.json({ error: err.message }, 500);
  }
});

Deno.serve(app.fetch);
