/**
 * LeadFlow — Database Seed Script
 * Run: node src/seed.js
 * Seeds demo users, leads, and transactions for development.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Lead = require('./models/Lead');
const Transaction = require('./models/Transaction');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leadflow';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Lead.deleteMany(), Transaction.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // ── Create Users ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('demo123', 12);
  const adminHash = await bcrypt.hash('admin123', 12);

  const [admin, designer1, designer2, client1, client2] = await User.insertMany([
    {
      name: 'Admin User',
      email: 'admin@demo.com',
      phone: '+91 99999 00000',
      password: adminHash,
      role: 'admin',
      isVerified: true,
      isActive: true,
    },
    {
      name: 'Priya Sharma',
      email: 'designer@demo.com',
      phone: '+91 98765 43210',
      password: passwordHash,
      role: 'designer',
      credits: 47,
      city: 'Mumbai',
      specializations: ['Interior Design', 'UI/UX Design'],
      minBudget: 50000,
      preferredLocations: ['Mumbai', 'Pune', 'Bangalore'],
      isVerified: true,
      isActive: true,
      totalLeadsPurchased: 18,
      totalSpent: 72,
    },
    {
      name: 'Arjun Mehta',
      email: 'arjun@demo.com',
      phone: '+91 97654 32109',
      password: passwordHash,
      role: 'designer',
      credits: 12,
      city: 'Delhi',
      specializations: ['Logo Design', 'Brand Identity'],
      minBudget: 10000,
      isVerified: true,
      isActive: true,
      totalLeadsPurchased: 6,
      totalSpent: 22,
    },
    {
      name: 'Rahul Gupta',
      email: 'client@demo.com',
      phone: '+91 96543 21098',
      password: passwordHash,
      role: 'client',
      isVerified: true,
      isActive: true,
    },
    {
      name: 'Ananya Singh',
      email: 'ananya@demo.com',
      phone: '+91 95432 10987',
      password: passwordHash,
      role: 'client',
      isVerified: true,
      isActive: true,
    },
  ]);

  console.log('👥 Users created:', [admin, designer1, designer2, client1, client2].map((u) => u.email).join(', '));

  // ── Create Leads ──────────────────────────────────────────────────────────
  const leads = await Lead.insertMany([
    {
      clientId: client1._id,
      clientName: 'Rahul Gupta',
      clientPhone: '+91 96543 21098',
      service: 'Interior Design',
      budget: 450000,
      budgetDisplay: '₹4.5L',
      location: 'Whitefield, Bangalore',
      description: 'Complete 3BHK interior with modern minimalist theme. Needs smart storage solutions and premium materials throughout. Budget is flexible for the right designer. Looking to start within 2 weeks.',
      preferredStyle: 'Modern',
      tags: ['Modern', 'Minimalist', '3BHK', 'Luxury', 'Urgent'],
      intentScore: 0.89,
      aiAnalyzed: true,
      status: 'open',
      quality: 'high',
      verifiedBy: admin._id,
      verifiedAt: new Date(),
      creditCost: 7,
    },
    {
      clientId: client2._id,
      clientName: 'Ananya Singh',
      clientPhone: '+91 95432 10987',
      service: 'UI/UX Design',
      budget: 120000,
      budgetDisplay: '₹1.2L',
      location: 'Andheri, Mumbai',
      description: 'Mobile app redesign for a fintech startup. Need modern, clean UI with excellent UX flow, onboarding screens, and a complete design system. We have existing wireframes.',
      preferredStyle: 'Modern',
      tags: ['Mobile App', 'Fintech', 'Modern', 'Design System'],
      intentScore: 0.84,
      aiAnalyzed: true,
      status: 'open',
      quality: 'high',
      verifiedBy: admin._id,
      verifiedAt: new Date(),
      creditCost: 5,
    },
    {
      clientId: client1._id,
      clientName: 'Rahul Gupta',
      clientPhone: '+91 96543 21098',
      service: 'Logo Design',
      budget: 18000,
      budgetDisplay: '₹18K',
      location: 'Connaught Place, Delhi',
      description: 'Brand identity for a new specialty coffee cafe. Need a modern, memorable logo that works on cups, packaging, and signage. Going for a minimal, premium feel.',
      preferredStyle: 'Minimal',
      tags: ['Cafe', 'Minimal', 'Playful', 'Startup'],
      intentScore: 0.71,
      aiAnalyzed: true,
      status: 'locked',
      quality: 'medium',
      verifiedBy: admin._id,
      verifiedAt: new Date(),
      lockedBy: designer2._id,
      lockExpiry: new Date(Date.now() + 90000), // 90 seconds from now
      creditCost: 3,
    },
    {
      clientId: client2._id,
      clientName: 'Ananya Singh',
      clientPhone: '+91 95432 10987',
      service: 'Interior Design',
      budget: 280000,
      budgetDisplay: '₹2.8L',
      location: 'Koregaon Park, Pune',
      description: 'Office space of 1200 sq ft needs a complete makeover. Prefer industrial-modern aesthetic with open collaboration areas and a dedicated meeting room.',
      preferredStyle: 'Industrial',
      tags: ['Office', 'Industrial', '1200sqft', 'Commercial'],
      intentScore: 0.76,
      aiAnalyzed: true,
      status: 'open',
      quality: 'high',
      verifiedBy: admin._id,
      verifiedAt: new Date(),
      creditCost: 5,
    },
    {
      clientId: client1._id,
      clientName: 'Rahul Gupta',
      clientPhone: '+91 96543 21098',
      service: 'Brand Identity',
      budget: 75000,
      budgetDisplay: '₹75K',
      location: 'Koramangala, Bangalore',
      description: 'Tech startup needs complete branding — logo, brand guidelines, social media kit, and website design direction. We are launching in Q2 2025.',
      preferredStyle: 'Modern',
      tags: ['Startup', 'Tech', 'Full Brand', 'Q2 Launch'],
      intentScore: 0.68,
      aiAnalyzed: true,
      status: 'open',
      quality: 'medium',
      verifiedBy: admin._id,
      verifiedAt: new Date(),
      creditCost: 4,
    },
    {
      clientId: client2._id,
      clientName: 'Ananya Singh',
      clientPhone: '+91 95432 10987',
      service: 'Interior Design',
      budget: 35000,
      budgetDisplay: '₹35K',
      location: 'Anna Nagar, Chennai',
      description: 'Need 3D renders of a residential project for client presentation. Require 4 exterior views and 3 interior views of the living and master bedroom.',
      tags: ['Residential', '3D Render', 'Exterior', 'Visualization'],
      intentScore: 0.54,
      aiAnalyzed: true,
      status: 'pending',
      quality: null,
      creditCost: 3,
    },
    // Sold lead (purchased by designer1)
    {
      clientId: client1._id,
      clientName: 'Rahul Gupta',
      clientPhone: '+91 96543 21098',
      service: 'Interior Design',
      budget: 350000,
      budgetDisplay: '₹3.5L',
      location: 'Bandra, Mumbai',
      description: '2BHK flat interior — complete design including kitchen, living room, and two bedrooms. Modern Scandinavian style preferred.',
      preferredStyle: 'Natural',
      tags: ['2BHK', 'Scandinavian', 'Modern', 'Mumbai'],
      intentScore: 0.82,
      aiAnalyzed: true,
      status: 'sold',
      quality: 'high',
      verifiedBy: admin._id,
      verifiedAt: new Date(Date.now() - 5 * 86400000),
      purchasedBy: designer1._id,
      purchasedAt: new Date(Date.now() - 4 * 86400000),
      creditCost: 5,
    },
  ]);

  console.log(`📋 ${leads.length} Leads created`);

  // ── Create Transactions ───────────────────────────────────────────────────
  await Transaction.insertMany([
    {
      userId: designer1._id,
      type: 'bonus',
      creditsDelta: 3,
      description: 'Welcome bonus — 3 free credits on signup',
      creditsBefore: 0,
      creditsAfter: 3,
      status: 'success',
      createdAt: new Date(Date.now() - 30 * 86400000),
    },
    {
      userId: designer1._id,
      type: 'credit_purchase',
      creditsDelta: 160,
      amountINR: 2499,
      description: 'Pro Pack — 150 credits + 10 bonus',
      paymentGateway: 'razorpay',
      paymentId: 'pay_demo_001',
      orderId: 'order_demo_001',
      creditsBefore: 3,
      creditsAfter: 163,
      status: 'success',
      createdAt: new Date(Date.now() - 15 * 86400000),
    },
    {
      userId: designer1._id,
      type: 'lead_purchase',
      creditsDelta: -5,
      description: `Purchased lead — Interior Design, Bandra Mumbai`,
      leadId: leads[6]._id,
      creditsBefore: 163,
      creditsAfter: 158,
      status: 'success',
      createdAt: new Date(Date.now() - 4 * 86400000),
    },
    {
      userId: designer1._id,
      type: 'refund',
      creditsDelta: 3,
      description: 'Refund — Invalid lead #LF-0003',
      creditsBefore: 158,
      creditsAfter: 161,
      status: 'success',
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      userId: designer2._id,
      type: 'bonus',
      creditsDelta: 3,
      description: 'Welcome bonus — 3 free credits on signup',
      creditsBefore: 0,
      creditsAfter: 3,
      status: 'success',
      createdAt: new Date(Date.now() - 20 * 86400000),
    },
    {
      userId: designer2._id,
      type: 'credit_purchase',
      creditsDelta: 50,
      amountINR: 999,
      description: 'Starter Pack — 50 credits',
      paymentGateway: 'razorpay',
      paymentId: 'pay_demo_002',
      orderId: 'order_demo_002',
      creditsBefore: 3,
      creditsAfter: 53,
      status: 'success',
      createdAt: new Date(Date.now() - 10 * 86400000),
    },
  ]);

  console.log('💳 Transactions created');

  console.log('\n✅ Seed complete!\n');
  console.log('Demo credentials:');
  console.log('  Admin:    admin@demo.com    / admin123');
  console.log('  Designer: designer@demo.com / demo123');
  console.log('  Client:   client@demo.com   / demo123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
