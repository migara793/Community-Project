import { FaSort } from 'react-icons/fa';

const DataTable = ({ data, sortConfig, onSort }) => {
  if (!data || data.length === 0) return null;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    onSort({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = sortConfig.key === 'date' ? a.date : 
                  sortConfig.key === 'value' ? parseFloat(a.predicted_value) :
                  sortConfig.key === 'change' ? calculateChange(a, data) : 0;
                  
    const bValue = sortConfig.key === 'date' ? b.date : 
                  sortConfig.key === 'value' ? parseFloat(b.predicted_value) :
                  sortConfig.key === 'change' ? calculateChange(b, data) : 0;

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  function calculateChange(item, allData) {
    const index = allData.findIndex(d => d.date === item.date);
    if (index <= 0) return 0;
    const prevValue = parseFloat(allData[index - 1].predicted_value);
    const currValue = parseFloat(item.predicted_value);
    return ((currValue - prevValue) / prevValue * 100);
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('date')}>
              Date <FaSort className={sortConfig.key === 'date' ? sortConfig.direction : ''} />
            </th>
            <th onClick={() => handleSort('value')}>
              Predicted Value <FaSort className={sortConfig.key === 'value' ? sortConfig.direction : ''} />
            </th>
            <th onClick={() => handleSort('change')}>
              Change <FaSort className={sortConfig.key === 'change' ? sortConfig.direction : ''} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => {
            const change = index > 0 ? 
              ((parseFloat(item.predicted_value) - parseFloat(sortedData[index - 1].predicted_value)) / 
               parseFloat(sortedData[index - 1].predicted_value) * 100).toFixed(2) : 
              '-';
            
            return (
              <tr key={item.date}>
                <td>{item.date}</td>
                <td>{parseFloat(item.predicted_value).toFixed(2)}</td>
                <td>{change === '-' ? change : `${change}%`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;