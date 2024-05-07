"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Board {
    id: number;
    name: string;
    description: string;
    isOwner: boolean;
    isDefault: boolean;
  }
  
  const mainPage: React.FC = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [newBoardName, setNewBoardName] = useState('');
  
    // HTTP GET to fetch the boards
    useEffect(() => {
      const fetchBoards = async () => {
        try {
          const token = sessionStorage.getItem('accessToken');
          const response = await fetch('http://localhost:8080/api/boards', {
            method: 'GET',
            headers: {
              Authorization: `${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch boards');
          }
          const data = await response.json();
          console.log(data);
          setBoards(data);
          
        } catch (error) {
          console.error('Error fetching boards:', error);
        }
      };
  
      fetchBoards();
    }, []);

    // HTTP POST to create a new board
    const handleCreateBoard = async () => {
      try {
          const token = sessionStorage.getItem('accessToken');
          const response = await fetch('http://localhost:8080/api/boards', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `${token}`,
              },
              body: JSON.stringify({ name: newBoardName}), // Assuming backend expects a name and description field
          });
          if (!response.ok) {
              throw new Error('Failed to create board');
          }
          const newBoard: Board = await response.json();
          setBoards(prevBoards => [...prevBoards, newBoard]); // Add the newly created board to the list
          setNewBoardName(''); // Reset the input field
      } catch (error) {
          console.error('Error creating board:', error);
      }
  };



  return (
    <div>
        <h1 className="main-title font-bold mt-20 flex justify-center">Choose a board</h1>
        <div className="flex flex-row justify-center items-center">
            <Link href={"/BoardPage"} className='border'>Go to Default Board Page</Link>
            <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter board name..."
                className="input px-2 py-1 ml-4"
            />
            <button onClick={handleCreateBoard} className="button ml-2">Create Board</button>
            <ul className='grid grid-cols-4 gap-4 mt-4'>
                {boards.map(board => (
                    <li key={board.id}>{board.name}</li>
                ))}
            </ul>
        </div>
    </div>
);
};

export default mainPage