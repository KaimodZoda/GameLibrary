'use client';

interface StatCardProps {
  type: 'total-games' | 'available' | 'borrowed' | 'pending' | 'returned' | 'return-in-progress' | 'overdue';
  value: number;
}

const StatCard = ({ type, value }: StatCardProps) => {
  const getCardConfig = () => {
    switch (type) {
      case 'total-games':
        return {
          title: 'Total Games',
          icon: 'fas fa-gamepad',
          bgColor: 'bg-indigo-100',
          iconColor: 'text-indigo-600'
        };
      case 'available':
        return {
          title: 'Available',
          icon: 'fas fa-check-circle',
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'borrowed':
        return {
          title: 'Borrowed',
          icon: 'fas fa-clock',
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 'pending':
        return {
          title: 'Pending',
          icon: 'fas fa-hourglass-half',
          bgColor: 'bg-orange-100',
          iconColor: 'text-orange-600'
        };
      case 'returned':
        return {
          title: 'Returned',
          icon: 'fas fa-check-circle',
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'return-in-progress':
        return {
          title: 'Return in Progress',
          icon: 'fas fa-spinner',
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600'
        };
      case 'overdue':
        return {
          title: 'Overdue',
          icon: 'fas fa-exclamation-triangle',
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      default:
        throw new Error(`Unknown stat card type: ${type}`);
    }
  };

  const config = getCardConfig();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
          <i className={`fas ${config.icon} ${config.iconColor} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">{config.title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toString()}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
