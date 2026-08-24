const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.complaintStatusHistory.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@society.com',
      passwordHash: adminPassword,
      role: 'admin',
      apartmentNo: 'A-001'
    }
  });

  // Create resident users
  console.log('Creating resident users...');
  const residentPassword = await bcrypt.hash('resident123', 10);

  const residents = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        passwordHash: residentPassword,
        role: 'resident',
        apartmentNo: 'A-101'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        passwordHash: residentPassword,
        role: 'resident',
        apartmentNo: 'A-102'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Amit Patel',
        email: 'amit@example.com',
        passwordHash: residentPassword,
        role: 'resident',
        apartmentNo: 'B-201'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sneha Reddy',
        email: 'sneha@example.com',
        passwordHash: residentPassword,
        role: 'resident',
        apartmentNo: 'B-202'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        passwordHash: residentPassword,
        role: 'resident',
        apartmentNo: 'C-301'
      }
    })
  ]);

  console.log('Creating complaints...');

  // Helper function to get random date in the past
  const getRandomPastDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  // Create complaints with varying statuses and priorities
  const complaints = [];

  // Recent open complaints (high priority overdue)
  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[0].id,
        category: 'Plumbing',
        description: 'Main water pipe burst in the basement. Water flooding the parking area. Immediate attention required.',
        priority: 'High',
        status: 'Open',
        photoUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
        createdAt: getRandomPastDate(10)
      }
    })
  );

  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[1].id,
        category: 'Electrical',
        description: 'Power outage in the entire B-block for the last 2 hours. No response from maintenance team yet.',
        priority: 'High',
        status: 'Open',
        photoUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
        createdAt: getRandomPastDate(8)
      }
    })
  );

  // In Progress complaints
  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[2].id,
        category: 'Elevator',
        description: 'Elevator in Tower A is making strange noises and stops intermittently between floors.',
        priority: 'High',
        status: 'InProgress',
        photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        createdAt: getRandomPastDate(5)
      }
    })
  );

  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[3].id,
        category: 'Cleaning',
        description: 'Garbage not collected from our floor for the past 3 days. Foul smell spreading.',
        priority: 'Medium',
        status: 'InProgress',
        photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
        createdAt: getRandomPastDate(3)
      }
    })
  );

  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[4].id,
        category: 'Security',
        description: 'CCTV camera near gate 2 has been non-functional for a week. Security concern.',
        priority: 'Medium',
        status: 'InProgress',
        photoUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
        createdAt: getRandomPastDate(7)
      }
    })
  );

  // Recently resolved
  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[0].id,
        category: 'Parking',
        description: 'Visitor parking slots are occupied by resident vehicles. Need proper enforcement.',
        priority: 'Low',
        status: 'Resolved',
        photoUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=80',
        createdAt: getRandomPastDate(15),
        resolvedAt: getRandomPastDate(2)
      }
    })
  );

  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[1].id,
        category: 'Noise',
        description: 'Construction noise from neighboring apartment starting at 7 AM daily.',
        priority: 'Medium',
        status: 'Resolved',
        photoUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80',
        createdAt: getRandomPastDate(12),
        resolvedAt: getRandomPastDate(1)
      }
    })
  );

  // More open complaints for diversity
  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[2].id,
        category: 'Plumbing',
        description: 'Leaking tap in common area washroom. Water wastage.',
        priority: 'Low',
        status: 'Open',
        photoUrl: 'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=800&q=80',
        createdAt: getRandomPastDate(2)
      }
    })
  );

  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[3].id,
        category: 'Other',
        description: 'Gym equipment needs maintenance. Treadmill not working properly.',
        priority: 'Low',
        status: 'Open',
        photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        createdAt: getRandomPastDate(4)
      }
    })
  );

  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[4].id,
        category: 'Electrical',
        description: 'Street lights in the garden area not working since last week.',
        priority: 'Medium',
        status: 'Open',
        photoUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80',
        createdAt: getRandomPastDate(6)
      }
    })
  );

  // Add more resolved for better stats
  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[0].id,
        category: 'Cleaning',
        description: 'Swimming pool cleaning required urgently.',
        priority: 'Medium',
        status: 'Resolved',
        photoUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80',
        createdAt: getRandomPastDate(20),
        resolvedAt: getRandomPastDate(15)
      }
    })
  );

  complaints.push(
    await prisma.complaint.create({
      data: {
        residentId: residents[1].id,
        category: 'Security',
        description: 'Main gate lock broken. Security risk.',
        priority: 'High',
        status: 'Resolved',
        photoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        createdAt: getRandomPastDate(18),
        resolvedAt: getRandomPastDate(14)
      }
    })
  );

  console.log('Creating complaint status history...');

  // Add status history for in-progress and resolved complaints
  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[2].id,
      fromStatus: 'Open',
      toStatus: 'InProgress',
      actorId: admin.id,
      note: 'Maintenance team dispatched. Elevator technician will inspect tomorrow.',
      changedAt: getRandomPastDate(4)
    }
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[3].id,
      fromStatus: 'Open',
      toStatus: 'InProgress',
      actorId: admin.id,
      note: 'Cleaning staff notified. Will clear garbage today evening.',
      changedAt: getRandomPastDate(2)
    }
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[4].id,
      fromStatus: 'Open',
      toStatus: 'InProgress',
      actorId: admin.id,
      note: 'CCTV repair scheduled for this weekend.',
      changedAt: getRandomPastDate(6)
    }
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[5].id,
      fromStatus: 'Open',
      toStatus: 'InProgress',
      actorId: admin.id,
      note: 'Warning notices issued to violating residents.',
      changedAt: getRandomPastDate(10)
    }
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[5].id,
      fromStatus: 'InProgress',
      toStatus: 'Resolved',
      actorId: admin.id,
      note: 'Parking slots cleared. Towing policy enforced.',
      changedAt: getRandomPastDate(2)
    }
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[6].id,
      fromStatus: 'Open',
      toStatus: 'InProgress',
      actorId: admin.id,
      note: 'Spoke with resident doing construction. Agreed to start at 9 AM.',
      changedAt: getRandomPastDate(8)
    }
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[6].id,
      fromStatus: 'InProgress',
      toStatus: 'Resolved',
      actorId: admin.id,
      note: 'Construction timing changed. Issue resolved.',
      changedAt: getRandomPastDate(1)
    }
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[10].id,
      fromStatus: 'Open',
      toStatus: 'InProgress',
      actorId: admin.id,
      note: 'Pool cleaning service contacted.',
      changedAt: getRandomPastDate(18)
    }
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[10].id,
      fromStatus: 'InProgress',
      toStatus: 'Resolved',
      actorId: admin.id,
      note: 'Pool cleaned and sanitized.',
      changedAt: getRandomPastDate(15)
    }
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[11].id,
      fromStatus: 'Open',
      toStatus: 'InProgress',
      actorId: admin.id,
      note: 'New lock ordered.',
      changedAt: getRandomPastDate(17)
    }
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaints[11].id,
      fromStatus: 'InProgress',
      toStatus: 'Resolved',
      actorId: admin.id,
      note: 'New lock installed. Gate secured.',
      changedAt: getRandomPastDate(14)
    }
  });

  console.log('Creating notices...');

  await prisma.notice.create({
    data: {
      title: 'Water Supply Interruption - This Sunday',
      body: 'Dear Residents, Please note that water supply will be interrupted this Sunday from 8 AM to 2 PM for maintenance of overhead tanks. Kindly store water in advance. Inconvenience regretted.',
      isImportant: true,
      createdBy: admin.id,
      createdAt: getRandomPastDate(2)
    }
  });

  await prisma.notice.create({
    data: {
      title: 'Monthly Maintenance Due',
      body: 'This is a reminder that monthly maintenance charges for this month are due by the 5th. Please clear pending dues to avoid late payment charges. Payment can be made online or at the office.',
      isImportant: true,
      createdBy: admin.id,
      createdAt: getRandomPastDate(5)
    }
  });

  await prisma.notice.create({
    data: {
      title: 'Society Annual General Meeting',
      body: 'The Annual General Meeting will be held on the 15th of next month at 6 PM in the community hall. All residents are requested to attend. Agenda includes budget approval and election of new committee members.',
      isImportant: false,
      createdBy: admin.id,
      createdAt: getRandomPastDate(8)
    }
  });

  await prisma.notice.create({
    data: {
      title: 'New Security Guidelines',
      body: 'For enhanced security, all residents must register their guests at the gate. Visitors will be issued temporary passes. Please carry your resident ID cards. These measures are for everyone\'s safety.',
      isImportant: false,
      createdBy: admin.id,
      createdAt: getRandomPastDate(12)
    }
  });

  await prisma.notice.create({
    data: {
      title: 'Diwali Celebration Event',
      body: 'Join us for the society Diwali celebration on the 20th at 7 PM in the garden area. Cultural programs, games for kids, and dinner will be arranged. RSVP by the 15th. Looking forward to celebrating together!',
      isImportant: false,
      createdBy: admin.id,
      createdAt: getRandomPastDate(15)
    }
  });

  await prisma.notice.create({
    data: {
      title: 'Parking Rules Reminder',
      body: 'Residents are reminded to park only in allotted slots. Visitor parking must not be used by residents. Vehicles parked in no-parking zones will be towed. Please cooperate.',
      isImportant: false,
      createdBy: admin.id,
      createdAt: getRandomPastDate(18)
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${residents.length + 1} (1 admin + ${residents.length} residents)`);
  console.log(`   Complaints: ${complaints.length}`);
  console.log(`   Status History: Multiple entries`);
  console.log(`   Notices: 6`);
  console.log('\n🔑 Login Credentials:');
  console.log('   Admin: admin@society.com / admin123');
  console.log('   Residents: resident123 (password for all residents)');
  console.log('   - rajesh@example.com');
  console.log('   - priya@example.com');
  console.log('   - amit@example.com');
  console.log('   - sneha@example.com');
  console.log('   - vikram@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
