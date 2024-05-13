"use client"
import { useEffect, useState } from 'react';

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
  const [isInputVisible, setIsInputVisible] = useState(false);

  // POST items
  const handleAddItem = async () => {
    const token = sessionStorage.getItem('accessToken');
    if (!isInputVisible) {
      // If input field is hidden, show input field
      setIsInputVisible(true);
      return;
    }
    try {
      const response = await fetch(`https://httpbin.org/post`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json',
        Authorization: `${token}`
        },
        body: JSON.stringify({name: newItemTitle})
      })
      if (response.ok) {
        // Add new item
        if (newItemTitle.trim() !== '') {
          const newItems = [...items, { id: Date.now(), title: newItemTitle }];
          setItems(newItems);
          setNewItemTitle('');
          setIsInputVisible(false); // Hides input field after adding item
        }
      } else {
        const errorMessage = await response.text(); // error from response
        console.log(`Failed to add item. Server responded with: ${errorMessage}`);
      }
    } catch (error) {
      console.log("Failed to add item: ", error); // catch network or json error
    }
  };

  // GET items
  // useEffect []
  const handleFetchItems = async () => {
    const token = sessionStorage.getItem('accessToken')
    const response = await fetch('http://localhost:8080/api/tasks', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `${token}`
      }
    })
    if (response.ok) {
      // add items to columns with the correct status
    }
  }
  
  return (
    <div className="column w-80 p-4 mr-4">
      <h2 className="column-title text-2xl font-semibold mb-4">{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="item py-2 mb-2">{item.title}</li>
        ))}
      </ul>
      <div className="mb-4">
        {/* Renders input field based on isInputVisible state */}
        {isInputVisible && (
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleAddItem();
              }
              if (e.key === "Escape") {
                setNewItemTitle("")
                setIsInputVisible(false)
              }
            }}
            placeholder="Add new item..."
            className="item-input w-full px-2 py-1"
          />
        )}
      </div>
      <div className="flex justify-center">
        <button onClick={handleAddItem} className="button text-white">
        {isInputVisible ? 'Add Item' : '+'}
        </button>
      {isInputVisible && (
        <button onClick={() => { setNewItemTitle(""); setIsInputVisible(false) }} className="cancel text-gray-600">
          Cancel
        </button>
      )}
      </div>
    </div>
  );
};

export default Column;