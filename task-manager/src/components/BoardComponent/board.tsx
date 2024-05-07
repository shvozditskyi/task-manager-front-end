"use client"
import { useState } from "react";
import Column from "./Column/column"

const mainPage = () => {
    const [columns, setColumns] = useState<string[]>(['Todo', 'In Progress', 'Done']);
    const [newColumnName, setNewColumnName] = useState('');
  
    const handleAddColumn = async () => {
      try {
        if (newColumnName.trim() !== '') {
          
          // Updating the column locally
          setColumns([...columns, newColumnName]);
          setNewColumnName('');
          
          // POST request to add column
          const token = sessionStorage.getItem('accessToken');
          const response = await fetch(`http://localhost:8080/api/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${token}`
            },
            body: JSON.stringify({ name: newColumnName }),
          });
          if (response.ok) {
            setColumns([...columns, newColumnName]);
            setNewColumnName('');
          } else {
            console.error('Failed to create column:', response.statusText);
          }

          if (!response.ok) {
            console.log(response)
            console.error('Failed to add column');
          }
        }
      } catch (error) {
        console.error('Error adding column:', error);
      }
    };
  
    // const handleRenameColumn = (index: number, newName: string) => {
    //   const updatedColumns = [...columns];
    //   updatedColumns[index] = newName;
    //   setColumns(updatedColumns);
    // };
  
    return (
      <div className="flex">
        {/* Sidebar */}
        <div className="column h-dvh mt-2 w-1/12 p-4">
          <h2 className="sidebar-title ">Other Boards</h2>
          <button className="placeholder-button text-sm mt-2">Placeholder button</button>
          <button className="placeholder-button text-sm mt-2">Placeholder button</button>
          <button className="placeholder-button text-sm mt-2">Placeholder button</button>

        </div>
      <div className="flex justify-center mt-2 mx-2">
        {columns.map((columnName, index) => (
          <Column key={index} title={columnName} />
        ))}
        <div className="flex-row justify-center items-center w-80 p-4 mr-4">
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleAddColumn();
              }
              if (e.key === "Escape") {
                setNewColumnName("")
              }
            }}
            placeholder="Enter column name..."
            className="item-input w-full px-2 py-1"
          />
          <button onClick={handleAddColumn} className="column-button mt-2 px-4 py-1 text-white ">
            Add Column
          </button>
        </div>
      </div>
      </div>
    );
  };
export default mainPage