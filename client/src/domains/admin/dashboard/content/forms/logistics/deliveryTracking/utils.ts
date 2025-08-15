
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'out_for_delivery': return 'bg-blue-100 text-blue-800';
    case 'in_transit': return 'bg-yellow-100 text-yellow-800';
    case 'picked_up': return 'bg-purple-100 text-purple-800';
    case 'delayed': return 'bg-orange-100 text-orange-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'same_day': return 'bg-red-100 text-red-800';
    case 'express': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
