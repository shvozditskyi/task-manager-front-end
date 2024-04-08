"use client"
import React, { useState, useEffect } from 'react';

interface Board {
    id: number;
    name: string;
    description: string;
    isOwner: boolean;
    isDefault: boolean;
  }
  
  const mainPage: React.FC = () => {
    const [boards, setBoards] = useState<Board[]>([]);
  
    useEffect(() => {
      const fetchBoards = async () => {
        try {
          // GET request to fetch columns
          const token = sessionStorage.getItem('accessToken');
          const response = await fetch('http://localhost:8080/api/getUserBoards', {
            method: 'GET',
            headers: {
              Authorization: `${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch boards');
          }
          const data = await response.json();
          setBoards(data);
        } catch (error) {
          console.error('Error fetching boards:', error);
        }
      };
  
      fetchBoards();
    }, []);

  return (
    <div>
      <h1 className="title font-bold mt-20 flex justify-center">Choose a board</h1>
      <div className="flex flex-row justify-center items-center">
      <ul className='grid grid-cols-4 gap-4'>
        {boards.map(board => (
          <li key={board.id}>{board.name}</li>
        ))}
      </ul>
      </div>
    </div>
  );
};

export default mainPage