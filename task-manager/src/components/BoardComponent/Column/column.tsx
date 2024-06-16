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
  columns: { id: number, name: string }[]; // array of all columns
  onItemMoved: any;
  itemMoved: boolean;
  setItemMoved: any;
  onColumnRename: () => void;
}

const Column: React.FC<ColumnProps> = ({ boardId, columnId, title, initialItems = [], columns, onItemMoved, itemMoved, setItemMoved, onColumnRename }) => {
  const [items, setItems] = useState<Item[]>(initialItems); // list of items
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});
  const [moveDropdownVisible, setMoveDropdownVisible] = useState<{ [key: number]: boolean }>({});
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [editingColumnName, setEditingColumnName] = useState(false);
  const [renameColumnName, setRenameColumnName] = useState(title);
  // const [itemMoved, setItemMoved] = useState(false);

  const [renamingItemId, setRenamingItemId] = useState<number | null>(null);
  const [renameItemName, setRenameItemName] = useState<string>("");



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

            setItems(newItems);
            setNewItemTitle('');
            setIsInputVisible(false);
            fetchItems();
          }
        } else {
          const errorMessage = await response.text();
          console.log(`Failed to add item. Server responded with: ${errorMessage}`);
        }
      } catch (error) {
        console.log("Failed to add item:", error);
      }
    } else {
      setErrorMessage("Task name needs at least 1 character");
    }
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

  const toggleMoveDropdown = (id: number) => {
    setMoveDropdownVisible(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // Hide dropdowns
  const hideDropdowns = () => {
    setDropdownVisible({});
    setMoveDropdownVisible({});
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

  const handleMoveItemToColumn = async (id: number, targetColumnId: number) => {
    if (targetColumnId !== columnId) {
      try {
        const token = sessionStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/tasks/${id}/${targetColumnId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`
          }
        });

        if (response.ok) {
          // Update tasks state in the frontend
          setItems(prevTasks => {
            const taskIndex = prevTasks.findIndex(task => task.id === id);
            if (taskIndex !== -1) {
              const updatedTasks = [...prevTasks];
              updatedTasks[taskIndex].statusId = targetColumnId;
              // setItemMoved(true);
              setErrorMessage("")
              onItemMoved();
              fetchItems();
              return updatedTasks;
            }
            return prevTasks;
          });
        } else {
          console.error('Failed to move item:', response.statusText);
        }
      } catch (error) {
        console.error('Error moving item:', error);
      }
    } else {
      setErrorMessage("You can't move an item to the same Column")
    }
  };

  // useEffect(() => {
  //   fetchItems();
  // }, [columnId]);

  useEffect(() => {
    if (itemMoved) {
      fetchItems();
      setItemMoved(false); // Reset itemMoved state
    }
  }, [itemMoved]);

  const handleRenameItem = async (itemId: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/tasks/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        },
        body: JSON.stringify({ name: renameItemName }), // Send updated column name
      });
      if (response.ok) {
        fetchItems()
        setErrorMessage("")
      } else {
        // setErrorMessage("Rename input empty, item deleted")
      }
    } catch (error) {
      console.error("Failed to rename item", error)
    }
  };

  const handleSaveRename = () => {
    if (renamingItemId !== null) {
      if (renameItemName.trim() !== '') {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === renamingItemId ? { ...item, title: renameItemName } : item
          )
        );
        setRenamingItemId(null); // Reset renaming state
        setRenameItemName(""); // Reset the new item name input
      } else {
        deleteItem(renamingItemId)
      }
    }
  };

  const handleColumnNameDoubleClick = () => {
    setRenameColumnName(title); // Set input value to current column name
    setEditingColumnName(true); // Enable edit mode
  };

  const handleColumnNameChange = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/tasks/status/name?statusId=${columnId}&name=${renameColumnName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        },
        body: JSON.stringify({ name: renameColumnName }), // Send updated column name
      });
      if (response.ok) {
        setEditingColumnName(false); // Disable edit mode
        setRenameColumnName(renameColumnName); // Update column name in the state
        onColumnRename();
        // Optionally, you can call a function to refresh the column list from the parent component
      } else {
        console.error('Failed to update column name:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating column name:', error);
    }
  };

  // Send a boolean true when MoveItem happens as prop to other column. 
  // in other column listen for the prop change and when it happens, FetchItems

  return (
    <div className="column w-80 p-4 mr-4">
      {editingColumnName ? (
        <input
          type="text"
          value={renameColumnName}
          onChange={(e) => setRenameColumnName(e.target.value)}
          onBlur={handleColumnNameChange} // Save changes when input loses focus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleColumnNameChange(); // Save changes on Enter key
            }
            if (e.key === 'Escape') {
              setEditingColumnName(false); // Cancel edit mode on Escape key
            }
          }}
          className="column-name-input text-black"
          autoFocus
        />
      ) : (
        <h2
          className="column-name column-title text-2xl font-semibold mb-4"
          onDoubleClick={handleColumnNameDoubleClick}
        >
          {title}
        </h2>
      )}
      <ul>
        {items.map((item) => (
          <div className='w-full flex flex-col' key={item.id}>
            <li className="item py-2 mb-2 flex justify-between items-center">
              {renamingItemId === item.id ? (
                <input
                  type="text"
                  value={renameItemName}
                  onChange={(e) => setRenameItemName(e.target.value)}
                  onBlur={handleSaveRename} // Save changes when input loses focus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveRename(); // Save changes on Enter key
                      handleRenameItem(item.id);
                    }
                    if (e.key === 'Escape') {
                      setRenamingItemId(null); // Cancel edit mode on Escape key
                    }
                  }}
                  className="item-name-input text-black"
                  autoFocus
                />
              ) : (
                <h2
                  className="item-title"
                  onDoubleClick={() => {
                    setRenamingItemId(item.id);
                    setRenameItemName(item.title); // Set the current item title as the new item name input value
                  }}
                >
                  {item.title}
                </h2>
              )}
              <div className='relative'>
                <button
                  className='board-menu cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the Link
                    toggleDropdown(item.id);
                  }}
                >
                  <img src={"/more.png"} alt="More Options" className="h-6 w-6 p-1 hover:bg-gray-600 rounded" />
                </button>
                {dropdownVisible[item.id] && (
                  // style z-index fixes png visibility through dropdown
                  <div ref={el => (dropdownRefs.current[item.id] = el)} className='dropdown-menu absolute right-0 top-8 bg-white border border-gray-300 text-black rounded shadow-lg' style={{ zIndex: 10 }}>
                    <button
                      className='block px-4 py-1 text-left w-full hover:bg-gray-200'
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the Link
                        toggleMoveDropdown(item.id);
                      }}
                    > Move to:
                      {moveDropdownVisible[item.id] && (
                        <div className='dropdown-menu absolute left-full top-0 bg-white border border-gray-300 rounded shadow-lg'>
                          {columns.map((column) => (
                            <button
                              key={column.id}
                              className='block px-4 py-1 text-left w-full hover:bg-gray-200'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveItemToColumn(item.id, column.id);
                                hideDropdowns();
                              }}
                            >
                              {column.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </button>
                    <button
                      className='relative block px-4 py-1 text-left w-full hover:bg-gray-200'
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the Link
                        deleteItem(item.id);
                        hideDropdowns();
                      }}
                    > Delete task
                    </button>
                    <button
                      className='relative block px-4 py-1 text-left w-full hover:bg-gray-200'
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the Link
                        setRenamingItemId(item.id);
                        setRenameItemName(item.title);
                        hideDropdowns();
                      }}
                    > Rename Task
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
            className="item-input w-full px-2 py-1 item text-black"
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
      <p className='error text-center'>{errorMessage}</p>
    </div>
  );
};

export default Column;