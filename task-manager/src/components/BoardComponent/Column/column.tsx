"use client";
import { useEffect, useRef, useState } from 'react';

interface Item {
  id: number;
  title: string;
  statusId: number; // Add statusId to items
}

interface ColumnProps {
  boardId: number;
  columnId: number;
  title: string;         // title of column
  initialItems?: Item[]; // initial items in the column
}

const Column: React.FC<ColumnProps> = ({ boardId, columnId, title, initialItems = [] }) => {
  const [items, setItems] = useState<Item[]>(initialItems); // list of items
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Fetch items
  const fetchItems = async () => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const response = await fetch(`http://localhost:8080/api/boards/${boardId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("column data: ", data);
        // Filter tasks by statusId and set to items
        const filteredItems = data.tasks.filter((task: any) => task.statusId === columnId);
        setItems(filteredItems.map((task: any) => ({
          id: task.id,
          title: task.name,
          statusId: task.statusId
        })));
        console.log("filtered tasks: ", filteredItems);
      } else {
        console.error('Failed to fetch items:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []); // initial render

  // POST item
  const handleAddItem = async () => {
  
    const token = sessionStorage.getItem('accessToken');
    if (!isInputVisible) {
      // If input field is hidden, show input field
      setIsInputVisible(true);
      return;
    }
    if (newItemTitle.trim().length > 0) {
    try {
      const newTask = {
        name: newItemTitle,
        boardId,
        statusId: columnId,
      };
      
      const response = await fetch(`http://localhost:8080/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        // Add new item to the state
        if (newItemTitle.trim() !== '') {
          const newItems = [...items, { id: Date.now(), title: newItemTitle, statusId: columnId }];
          console.log("columnID: ",columnId,);
          
          setItems(newItems);
          setNewItemTitle('');
          setIsInputVisible(false);
        }
      } else {
        const errorMessage = await response.text();
        console.log(`Failed to add item. Server responded with: ${errorMessage}`);
      }
    } catch (error) {
      console.log("Failed to add item:", error);
    }
  } else {alert("Task name needs at least 1 character")}
};

  // DELETE item
  const deleteItem = async (id: number) => {
    const token = sessionStorage.getItem("accessToken")
    try {
      const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
      method: "DELETE",
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      }); 
      if (!response.ok) {
        throw new Error(`Failed to delete item, Server responded with: ${response.text}`)
      } else {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  }


    // Toggle visibility
    const toggleDropdown = (id: number) => {
      setDropdownVisible(prevState => ({
        ...prevState,
        [id]: !prevState[id],
      }));
    };
  
    // Hide dropdowns
    const hideDropdowns = () => {
      setDropdownVisible({});
    };
  
    // Handle click outside dropdown and ESC
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (Object.values(dropdownRefs.current).some(ref => ref && ref.contains(target))) {
          return;
        }
        hideDropdowns();
      };
  
      const handleEscKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          hideDropdowns();
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKeyPress);
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscKeyPress);
      };
    }, []);

  return (
    <div className="column w-80 p-4 mr-4">
      <h2 className="column-title text-2xl font-semibold mb-4">{title}</h2>
      <ul>
        {items.map((item) => (
        <div className='w-full flex flex-col'>
          <li key={item.id} className="item py-2 mb-2 flex justify-between items-center">{item.title}
          <div className='relative col-span-1 '>
            <button
                      className='board-menu cursor-pointer '
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the Link
                toggleDropdown(item.id);
              }}
            >
              <img src={"/more.png"} alt="More Options" className="h-6 w-6 p-1 hover:bg-gray-600 rounded" />
            </button>
            {dropdownVisible[item.id] && (
              <div ref={el => (dropdownRefs.current[item.id] = el)} className='dropdown-menu absolute right-0 top-8 bg-white border border-gray-300 rounded shadow-lg z-100'>
                <button
                  className='block px-4 py-2 text-left w-full hover:bg-gray-200'
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the Link
                    deleteItem(item.id);
                    hideDropdowns();
                  }}
                >Delete task
                </button>
              <button
              className='block px-4 py-2 text-left w-full hover:bg-gray-200'
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the Link
                hideDropdowns();
              }}
            >Rename Task (WIP)
            </button>
          </div>
        )}
      </div>
        </li>
      </div>
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
                setNewItemTitle("");
                setIsInputVisible(false);
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
          <button onClick={() => { setNewItemTitle(""); setIsInputVisible(false); }} className="cancel text-gray-600">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default Column;