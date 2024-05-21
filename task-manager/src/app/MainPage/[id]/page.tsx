"use client";
import { useEffect, useState } from "react";
import Column from "@/components/BoardComponent/Column/column";

interface Status {
  id: number;
  name: string;
  orderNumber: number;
}

export default function Board({ params }: { params: any }) {
  const [columns, setColumns] = useState<Status[]>([]);
  const [newColumnName, setNewColumnName] = useState('');

  const fetchBoardDetails = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/boards/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });
      if (response.ok) {
        const data = await response.json();
        setColumns(data.statuses);
      } else {
        console.error('Failed to fetch board details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching board details:', error);
    }
  };

  useEffect(() => {
    fetchBoardDetails();
  }, [params.id]); // Dependency array with params.id to refetch if id changes

  const handleAddColumn = async () => {
    try {
      if (newColumnName.trim() !== '') {
        const token = sessionStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/boards/newStatus?boardId=${params.id}&name=${newColumnName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name: newColumnName, orderNumber: columns.length }),
        });
        if (response.ok) {
          fetchBoardDetails(); // Refresh columns
          setNewColumnName('');
        } else {
          console.error('Failed to create column:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="column h-dvh mt-2 w-1/12 p-4 min-w-32">
        <h2 className="sidebar-title">Other Boards</h2>
        <button className="placeholder-button text-sm mt-2">Placeholder button</button>
        <button className="placeholder-button text-sm mt-2">Placeholder button</button>
        <button className="placeholder-button text-sm mt-2">Placeholder button</button>
      </div>
      {/* Main Columns */}
      <div className="flex justify-center mt-2 mx-2">
        {columns.map((column) => (
          <Column key={column.id} title={column.name} />
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
          <button onClick={handleAddColumn} className="column-button mt-2 px-4 py-1 text-white">
            Add Column
          </button>
        </div>
      </div>
    </div>
  );
};