
 
function toggleSidebarRight() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("hidden");
  }

// Sample lead data
const leadsData = [
    {
        id: 1,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        type: 'contact',
        typeName: 'Contact Form',
        message: 'Looking for mobile app development services for my startup. We need a cross-platform solution with payment integration.',
        location: 'Mumbai, MH',
        date: '14 Dec, 10:30 AM',
        status: 'new',
        statusName: 'New',
        initials: 'RS',
        color: 'purple'
    },
    {
        id: 2,
        name: 'Priya Patel',
        email: 'priya.p@example.com',
        phone: '+91 87654 32109',
        type: 'meet',
        typeName: 'Google Meet',
        message: 'Need consultation for e-commerce website redesign. Currently using Shopify but want custom solution.',
        location: 'Ahmedabad, GJ',
        date: '14 Dec, 09:15 AM',
        status: 'contacted',
        statusName: 'Contacted',
        meetingTime: '15 Dec, 02:00 PM',
        initials: 'PP',
        color: 'green'
    },
    {
        id: 3,
        name: 'Amit Kumar',
        email: 'amit.k@example.com',
        phone: '+91 76543 21098',
        type: 'callback',
        typeName: 'Callback',
        message: 'Urgent: Need to discuss AI integration for existing platform. Budget approved.',
        location: 'Bangalore, KA',
        date: '14 Dec, 08:45 AM',
        status: 'new',
        statusName: 'New',
        initials: 'AK',
        color: 'yellow'
    },
    {
        id: 4,
        name: 'Sneha Gupta',
        email: 'sneha@example.com',
        phone: '+91 65432 10987',
        type: 'contact',
        typeName: 'Contact Form',
        message: 'Interested in custom CRM development for retail business with 50+ stores.',
        location: 'Delhi, DL',
        date: '13 Dec, 04:20 PM',
        status: 'completed',
        statusName: 'Completed',
        initials: 'SG',
        color: 'pink'
    },
    {
        id: 5,
        name: 'Vikram Joshi',
        email: 'vikram@example.com',
        phone: '+91 54321 09876',
        type: 'meet',
        typeName: 'Google Meet',
        message: 'Want to explore blockchain solutions for supply chain management.',
        location: 'Pune, MH',
        date: '13 Dec, 02:10 PM',
        status: 'new',
        statusName: 'New',
        meetingTime: '16 Dec, 11:00 AM',
        initials: 'VJ',
        color: 'indigo'
    },
    {
        id: 6,
        name: 'Ananya Singh',
        email: 'ananya@example.com',
        phone: '+91 43210 98765',
        type: 'callback',
        typeName: 'Callback',
        message: 'Need pricing quote for mobile app maintenance and support services.',
        location: 'Hyderabad, TS',
        date: '13 Dec, 01:30 PM',
        status: 'contacted',
        statusName: 'Contacted',
        initials: 'AS',
        color: 'blue'
    },
    {
        id: 7,
        name: 'Rajesh Verma',
        email: 'rajesh.v@example.com',
        phone: '+91 32109 87654',
        type: 'contact',
        typeName: 'Contact Form',
        message: 'Healthcare startup looking for HIPAA compliant web application development.',
        location: 'Chennai, TN',
        date: '13 Dec, 11:45 AM',
        status: 'new',
        statusName: 'New',
        initials: 'RV',
        color: 'red'
    },
    {
        id: 8,
        name: 'Kavya Reddy',
        email: 'kavya@example.com',
        phone: '+91 21098 76543',
        type: 'meet',
        typeName: 'Google Meet',
        message: 'Fintech startup seeking consultation for payment gateway integration.',
        location: 'Bangalore, KA',
        date: '12 Dec, 05:20 PM',
        status: 'completed',
        statusName: 'Completed',
        meetingTime: '13 Dec, 03:30 PM',
        initials: 'KR',
        color: 'teal'
    },
    {
        id: 9,
        name: 'Arjun Mehta',
        email: 'arjun.m@example.com',
        phone: '+91 10987 65432',
        type: 'callback',
        typeName: 'Callback',
        message: 'Restaurant chain wants food delivery app with real-time tracking.',
        location: 'Kolkata, WB',
        date: '12 Dec, 03:15 PM',
        status: 'new',
        statusName: 'New',
        initials: 'AM',
        color: 'orange'
    },
    {
        id: 10,
        name: 'Neha Kapoor',
        email: 'neha@example.com',
        phone: '+91 09876 54321',
        type: 'contact',
        typeName: 'Contact Form',
        message: 'EdTech platform needs LMS development with video streaming capabilities.',
        location: 'Jaipur, RJ',
        date: '12 Dec, 01:50 PM',
        status: 'contacted',
        statusName: 'Contacted',
        initials: 'NK',
        color: 'cyan'
    }
];


let currentLeadId = null;
let filteredLeads = [...leadsData];

// Initialize dashboard
function initDashboard() {
    renderLeads(filteredLeads);
    updateStats();
}

// Render leads table
function renderLeads(leads) {
    const tbody = document.getElementById('leadsTable');
    tbody.innerHTML = '';

    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-white/5 transition lead-row';
        row.dataset.type = lead.type;
        row.dataset.status = lead.status;
        
        const typeColors = {
            'contact': 'blue',
            'meet': 'green',
            'callback': 'yellow'
        };
        
        const statusColors = {
            'new': 'purple',
            'contacted': 'blue',
            'completed': 'green'
        };

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-white">#${String(lead.id).padStart(3, '0')}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-${lead.color}-500 rounded-full flex items-center justify-center text-white text-sm mr-3">${lead.initials}</div>
                    <span class="text-white">${lead.name}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-300">
                    <div><i class="fas fa-envelope mr-2"></i>${lead.email}</div>
                    <div><i class="fas fa-phone mr-2"></i>${lead.phone}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 bg-${typeColors[lead.type]}-500/20 text-${typeColors[lead.type]}-400 rounded-full text-xs">
                    <i class="fas fa-${lead.type === 'contact' ? 'file-alt' : lead.type === 'meet' ? 'video' : 'phone'} mr-1"></i>${lead.typeName}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">${lead.message}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <i class="fas fa-map-marker-alt mr-1"></i>${lead.location}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${lead.date}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 bg-${statusColors[lead.status]}-500 text-white rounded-full text-xs">${lead.statusName}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="viewDetails(${lead.id})" class="text-blue-400 hover:text-blue-300 mr-3" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="contactLead(${lead.id})" class="text-green-400 hover:text-green-300 mr-3" title="Mark as Contacted">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="deleteLead(${lead.id})" class="text-red-400 hover:text-red-300" title="Delete Lead">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}



// Update statistics
function updateStats() {
    const contactCount = leadsData.filter(l => l.type === 'contact').length;
    const meetCount = leadsData.filter(l => l.type === 'meet').length;
    const callbackCount = leadsData.filter(l => l.type === 'callback').length;
    
    document.getElementById('totalLeads').textContent = leadsData.length;
    document.getElementById('contactForms').textContent = contactCount;
    document.getElementById('meetRequests').textContent = meetCount;
    document.getElementById('callbackRequests').textContent = callbackCount;
    document.getElementById('totalEntries').textContent = leadsData.length;
    document.getElementById('showingTo').textContent = Math.min(10, leadsData.length);
}

// Filter leads by type
function filterLeads(type) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-purple-600');
        btn.classList.add('bg-white/10');
    });
    
    event.target.classList.remove('bg-white/10');
    event.target.classList.add('bg-purple-600');
    
    if (type === 'all') {
        filteredLeads = [...leadsData];
    } else {
        filteredLeads = leadsData.filter(lead => lead.type === type);
    }
    
    renderLeads(filteredLeads);
}

// Filter by status
function filterByStatus() {
    const status = document.getElementById('statusFilter').value;
    
    if (status === 'all') {
        filteredLeads = [...leadsData];
    } else {
        filteredLeads = leadsData.filter(lead => lead.status === status);
    }
    
    renderLeads(filteredLeads);
}

// Search functionality
document.getElementById('searchBar').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    filteredLeads = leadsData.filter(lead => {
        return lead.name.toLowerCase().includes(searchTerm) ||
               lead.email.toLowerCase().includes(searchTerm) ||
               lead.phone.includes(searchTerm) ||
               lead.message.toLowerCase().includes(searchTerm) ||
               lead.location.toLowerCase().includes(searchTerm);
    });
    
    renderLeads(filteredLeads);
});

// View lead details
function viewDetails(id) {
    const lead = leadsData.find(l => l.id === id);
    if (!lead) return;
    
    currentLeadId = id;
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('modalContent');
    
    const typeColors = {
        'contact': 'blue',
        'meet': 'green',
        'callback': 'yellow'
    };
    
    const statusColors = {
        'new': 'purple',
        'contacted': 'blue',
        'completed': 'green'
    };
    
    let meetingInfo = '';
    if (lead.meetingTime) {
        meetingInfo = `
            <div>
                <p class="text-gray-400 text-sm">Meeting Scheduled</p>
                <p class="text-white font-semibold"><i class="fas fa-calendar mr-2"></i>${lead.meetingTime}</p>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div>
                <p class="text-gray-400 text-sm">Name</p>
                <p class="text-white font-semibold">${lead.name}</p>
            </div>
            <div>
                <p class="text-gray-400 text-sm">Type</p>
                <span class="px-3 py-1 bg-${typeColors[lead.type]}-500/20 text-${typeColors[lead.type]}-400 rounded-full text-xs">
                    ${lead.typeName}
                </span>
            </div>
            <div>
                <p class="text-gray-400 text-sm">Email</p>
                <p class="text-white font-semibold">${lead.email}</p>
            </div>
            <div>
                <p class="text-gray-400 text-sm">Phone</p>
                <p class="text-white font-semibold">${lead.phone}</p>
            </div>
            <div>
                <p class="text-gray-400 text-sm">Location</p>
                <p class="text-white font-semibold">${lead.location}</p>
            </div>
            <div>
                <p class="text-gray-400 text-sm">Date</p>
                <p class="text-white font-semibold">${lead.date}</p>
            </div>
            ${meetingInfo}
        </div>
        <div class="mt-6">
            <p class="text-gray-400 text-sm mb-2">Message</p>
            <p class="text-white bg-white/5 p-4 rounded-lg">${lead.message}</p>
        </div>
        <div class="mt-6">
            <p class="text-gray-400 text-sm mb-2">Status</p>
            <span class="px-4 py-2 bg-${statusColors[lead.status]}-500 text-white rounded-full text-sm">${lead.statusName}</span>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('detailsModal').classList.add('hidden');
    currentLeadId = null;
}

// Mark as contacted
function markAsContacted() {
    if (currentLeadId) {
        const lead = leadsData.find(l => l.id === currentLeadId);
        if (lead) {
            lead.status = 'contacted';
            lead.statusName = 'Contacted';
            renderLeads(filteredLeads);
            closeModal();
            showNotification('Lead marked as contacted!', 'success');
        }
    }
}

// Contact lead
function contactLead(id) {
    if (confirm('Mark this lead as contacted?')) {
        const lead = leadsData.find(l => l.id === id);
        if (lead) {
            lead.status = 'contacted';
            lead.statusName = 'Contacted';
            renderLeads(filteredLeads);
            showNotification('Lead #' + id + ' marked as contacted!', 'success');
        }
    }
}

