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
          const response = await fetch(`http://localhost:8080/api/createPrivateBoard`, {
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
      <div className="flex justify-center mt-8">
        {columns.map((columnName, index) => (
          <Column key={index} title={columnName} />
        ))}
        <div className="w-80 p-4 mr-4">
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="Enter column name..."
            className="w-full px-2 py-1 hide"
          />
          <button onClick={handleAddColumn} className="mt-2 bg-blue-500 text-white px-4 py-1 rounded">
            Add Column
          </button>
        </div>
      </div>
    );
  };
export default mainPage