const express = require('express');
const router = express.Router();

// Get hotel information
router.get('/info', (req, res) => {
  const hotelInfo = {
    name: 'Grand Plaza Hotel',
    address: '123 Main Street, Downtown',
    phone: '+1 (555) 123-4567',
    email: 'info@grandplazahotel.com',
    checkIn: '3:00 PM',
    checkOut: '11:00 AM',
    wifi: {
      network: 'Hotel_Guest_WiFi',
      password: 'Welcome2024!'
    },
    amenities: [
      'Free WiFi',
      'Swimming Pool',
      'Fitness Center',
      'Spa & Wellness',
      'Restaurant',
      'Room Service',
      'Business Center',
      'Concierge Service'
    ]
  };
  
  res.json({
    success: true,
    hotel: hotelInfo
  });
});

// Get facilities information
router.get('/facilities', (req, res) => {
  const facilities = {
    swimmingPool: {
      name: 'Swimming Pool',
      location: '3rd Floor',
      hours: '6:00 AM - 10:00 PM',
      description: 'Outdoor heated pool with lounge chairs and towels provided',
      image: '/images/pool.jpg'
    },
    fitnessCenter: {
      name: 'Fitness Center',
      location: '2nd Floor',
      hours: '24/7',
      description: 'Fully equipped gym with treadmills, weights, and yoga studio',
      image: '/images/gym.jpg'
    },
    spa: {
      name: 'Spa & Wellness',
      location: '4th Floor',
      hours: '9:00 AM - 8:00 PM',
      description: 'Relaxing spa services including massage, facial, and sauna',
      image: '/images/spa.jpg'
    },
    restaurant: {
      name: 'Main Restaurant',
      location: '1st Floor',
      hours: '6:30 AM - 10:30 PM',
      description: 'Fine dining restaurant serving international cuisine',
      image: '/images/restaurant.jpg'
    },
    rooftopBar: {
      name: 'Rooftop Bar',
      location: '10th Floor',
      hours: '4:00 PM - 12:00 AM',
      description: 'Rooftop bar with city views and craft cocktails',
      image: '/images/bar.jpg'
    },
    businessCenter: {
      name: 'Business Center',
      location: '1st Floor',
      hours: '7:00 AM - 9:00 PM',
      description: 'Meeting rooms, printing, fax, and business services',
      image: '/images/business.jpg'
    }
  };
  
  res.json({
    success: true,
    facilities
  });
});

// Get local attractions
router.get('/attractions', (req, res) => {
  const attractions = {
    attractions: [
      {
        name: 'City Museum',
        distance: '0.5 miles',
        hours: '9:00 AM - 6:00 PM',
        description: 'Local history and art exhibitions',
        category: 'Culture',
        image: '/images/museum.jpg'
      },
      {
        name: 'Central Park',
        distance: '0.3 miles',
        hours: '24/7',
        description: 'Beautiful walking trails and gardens',
        category: 'Nature',
        image: '/images/park.jpg'
      },
      {
        name: 'Art Gallery',
        distance: '0.8 miles',
        hours: '10:00 AM - 7:00 PM',
        description: 'Contemporary art exhibitions',
        category: 'Culture',
        image: '/images/gallery.jpg'
      }
    ],
    restaurants: [
      {
        name: 'La Trattoria',
        distance: '0.2 miles',
        cuisine: 'Italian',
        priceRange: '$$',
        hours: '11:00 AM - 11:00 PM',
        description: 'Authentic Italian cuisine',
        image: '/images/trattoria.jpg'
      },
      {
        name: 'Sushi Master',
        distance: '0.4 miles',
        cuisine: 'Japanese',
        priceRange: '$$$',
        hours: '12:00 PM - 10:00 PM',
        description: 'Fresh sushi and sashimi',
        image: '/images/sushi.jpg'
      },
      {
        name: 'The Grill House',
        distance: '0.6 miles',
        cuisine: 'American',
        priceRange: '$$',
        hours: '5:00 PM - 11:00 PM',
        description: 'Steaks and seafood',
        image: '/images/grill.jpg'
      }
    ],
    shopping: [
      {
        name: 'Downtown Mall',
        distance: '0.7 miles',
        description: '100+ stores including major retailers',
        hours: '10:00 AM - 9:00 PM',
        category: 'Shopping Center',
        image: '/images/mall.jpg'
      },
      {
        name: 'Fashion District',
        distance: '1.2 miles',
        description: 'Designer boutiques and fashion stores',
        hours: '11:00 AM - 8:00 PM',
        category: 'Fashion',
        image: '/images/fashion.jpg'
      },
      {
        name: 'Local Market',
        distance: '0.9 miles',
        description: 'Artisan goods and local products',
        hours: '8:00 AM - 6:00 PM',
        category: 'Local',
        image: '/images/market.jpg'
      }
    ]
  };
  
  res.json({
    success: true,
    attractions
  });
});

// Submit housekeeping request
router.post('/housekeeping', (req, res) => {
  const { roomNumber, requestType, items, specialInstructions } = req.body;
  
  if (!roomNumber || !requestType) {
    return res.status(400).json({
      success: false,
      error: 'Room number and request type are required'
    });
  }
  
  const request = {
    id: Date.now().toString(),
    roomNumber,
    requestType,
    items: items || [],
    specialInstructions: specialInstructions || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // In a real implementation, save to database and notify housekeeping
  console.log('Housekeeping request:', request);
  
  res.json({
    success: true,
    request,
    message: 'Housekeeping request submitted successfully!'
  });
});

// Request late checkout
router.post('/late-checkout', (req, res) => {
  const { roomNumber, requestedTime, reason } = req.body;
  
  if (!roomNumber || !requestedTime) {
    return res.status(400).json({
      success: false,
      error: 'Room number and requested time are required'
    });
  }
  
  const request = {
    id: Date.now().toString(),
    roomNumber,
    requestedTime,
    reason: reason || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // In a real implementation, check availability and save to database
  console.log('Late checkout request:', request);
  
  res.json({
    success: true,
    request,
    message: 'Late checkout request submitted! We will confirm availability within 30 minutes.'
  });
});

module.exports = router; 