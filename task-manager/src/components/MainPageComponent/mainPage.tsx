"use client"
import { useState } from "react";
import Column from "./Column/mainPageColumn"

const mainPage = () => {
    const [columns, setColumns] = useState<string[]>(['Todo', 'In Progress', 'Done']);
    const [newColumnName, setNewColumnName] = useState('');
  
    const handleAddColumn = () => {
      if (newColumnName.trim() !== '') {
        setColumns([...columns, newColumnName]);
        setNewColumnName('');
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
            className="w-full px-2 py-1"
          />
          <button onClick={handleAddColumn} className="mt-2 bg-blue-500 text-white px-4 py-1 rounded">
            Add Column
          </button>
        </div>
      </div>
    );
  };
export default mainPage