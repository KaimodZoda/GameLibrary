interface Stat {
  id: number;
  title: string;
  value: string;
  icon: string;
  bgColor: string;
  iconColor: string;
}

const StatsSection = () => {
  const stats: Stat[] = [
    {
      id: 1,
      title: 'Total Games',
      value: '156',
      icon: 'fas fa-gamepad',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      id: 2,
      title: 'Available',
      value: '89',
      icon: 'fas fa-check-circle',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 3,
      title: 'Borrowed',
      value: '67',
      icon: 'fas fa-clock',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      id: 4,
      title: 'Overdue',
      value: '3',
      icon: 'fas fa-exclamation-triangle',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map(stat => (
        <div key={stat.id} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className={`p-3 ${stat.bgColor} rounded-full`}>
              <i className={`${stat.icon} ${stat.iconColor} text-xl`}></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;
