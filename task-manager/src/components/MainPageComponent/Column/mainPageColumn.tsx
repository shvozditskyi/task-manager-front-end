import { useState } from 'react';

interface Item {
  id: number;
  title: string;
}

interface ColumnProps {
  title: string;         //title of column
  initialItems?: Item[]; //initial items in the column ?
} 

const Column: React.FC<ColumnProps> = ({ title, initialItems = [] }) => {
  const [items, setItems] = useState<Item[]>(initialItems); //list of items
  const [newItemTitle, setNewItemTitle] = useState('');

  const handleAddItem = () => {
    if (newItemTitle.trim() !== '') {
      const newItems = [...items, { id: Date.now(), title: newItemTitle }];
      setItems(newItems);
      setNewItemTitle('');
    }
  };

  return (
    <div className="column w-80 p-4 mr-4">
      <h2 className="column-title text-2xl font-semibold mb-4">{title}</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Add new item..."
          className="item-input w-full px-2 py-1"
        />
        {/* for now making it a button, will change it later */}
        <button onClick={handleAddItem} className="mt-2 bg-blue-500 text-white px-4 py-1 rounded">
          Add   
        </button>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="item py-2">{item.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Column;