const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Get menu items
router.get('/menu', (req, res) => {
  const menu = {
    categories: [
      {
        name: 'Pizzas',
        items: [
          { id: 'pizza-1', name: 'Margherita', price: 15, description: 'Fresh mozzarella, tomato sauce, basil' },
          { id: 'pizza-2', name: 'Pepperoni', price: 17, description: 'Pepperoni, mozzarella, tomato sauce' },
          { id: 'pizza-3', name: 'Vegetarian', price: 16, description: 'Mushrooms, bell peppers, onions, olives' }
        ]
      },
      {
        name: 'Burgers',
        items: [
          { id: 'burger-1', name: 'Classic Burger', price: 12, description: 'Beef patty, lettuce, tomato, cheese' },
          { id: 'burger-2', name: 'Chicken Burger', price: 14, description: 'Grilled chicken, avocado, special sauce' },
          { id: 'burger-3', name: 'Veggie Burger', price: 13, description: 'Plant-based patty, fresh vegetables' }
        ]
      },
      {
        name: 'Pasta',
        items: [
          { id: 'pasta-1', name: 'Carbonara', price: 18, description: 'Eggs, cheese, pancetta, black pepper' },
          { id: 'pasta-2', name: 'Bolognese', price: 19, description: 'Ground beef, tomato sauce, parmesan' },
          { id: 'pasta-3', name: 'Alfredo', price: 17, description: 'Cream, parmesan, garlic, butter' }
        ]
      },
      {
        name: 'Salads',
        items: [
          { id: 'salad-1', name: 'Caesar Salad', price: 10, description: 'Romaine, croutons, parmesan, caesar dressing' },
          { id: 'salad-2', name: 'Greek Salad', price: 11, description: 'Cucumber, tomatoes, olives, feta cheese' },
          { id: 'salad-3', name: 'Garden Salad', price: 9, description: 'Mixed greens, vegetables, house dressing' }
        ]
      },
      {
        name: 'Desserts',
        items: [
          { id: 'dessert-1', name: 'Chocolate Cake', price: 8, description: 'Rich chocolate cake with ganache' },
          { id: 'dessert-2', name: 'Ice Cream', price: 6, description: 'Vanilla, chocolate, or strawberry' },
          { id: 'dessert-3', name: 'Cheesecake', price: 9, description: 'New York style cheesecake' }
        ]
      }
    ]
  };
  
  res.json({
    success: true,
    menu
  });
});

// Place an order
router.post('/place', (req, res) => {
  const { items, roomNumber, specialInstructions, guestName } = req.body;
  
  if (!items || !roomNumber) {
    return res.status(400).json({
      success: false,
      error: 'Items and room number are required'
    });
  }
  
  const order = {
    id: uuidv4(),
    items,
    roomNumber,
    specialInstructions: specialInstructions || '',
    guestName: guestName || 'Guest',
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
  };
  
  // In a real implementation, save to database
  console.log('New order placed:', order);
  
  res.json({
    success: true,
    order,
    message: 'Order placed successfully! Your order will be delivered within 30 minutes.'
  });
});

// Get order status
router.get('/status/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  // In a real implementation, fetch from database
  const order = {
    id: orderId,
    status: 'preparing',
    estimatedDelivery: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  };
  
  res.json({
    success: true,
    order
  });
});

// Get orders for a room
router.get('/room/:roomNumber', (req, res) => {
  const { roomNumber } = req.params;
  
  // In a real implementation, fetch from database
  const orders = [];
  
  res.json({
    success: true,
    orders
  });
});

module.exports = router; 