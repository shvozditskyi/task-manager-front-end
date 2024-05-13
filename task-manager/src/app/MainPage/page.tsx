"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Board = {
  id: number;
  name: string;
  description: string;
  isOwner: boolean;
  isDefault: boolean;
};
  
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
              'Content-Type': 'application/json',
              Authorization: `${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch boards');
          } else {
          const data = await response.json();
          // console.log("Data: ",data);
          setBoards(data);
          }
        } catch (error) {
          console.error('Error fetching boards:', error);
        }
      };
  
      fetchBoards();
    }, []); //only renders once

    // HTTP POST to create a new board
    // https://httpbin.org/post
    // http://localhost:8080/api/boards
    const handleCreateBoard = async () => {
      try {
        // console.log("name test:", newBoardName)
        const token = sessionStorage.getItem('accessToken');
        const response = await fetch('https://httpbin.org/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({ 
            name: newBoardName,
          }), // only name is required
        });
        if (!response.ok) {
          throw new Error('Failed to create board');
        }
        const responseData = await response.json(); 
        const {name} = responseData.json;
        const newBoard = { id: Date.now(), name, description: '', isOwner: true, isDefault: false }; // Creating newBoard
        setBoards(prevBoards => [...prevBoards, newBoard]); // Add newBoard to boards array
        setNewBoardName(''); // Reset input
      } catch (error) {
        console.error('Error creating board:', error);
      }
    };
    // useEffect(() => {
    //   console.log('All boards:', boards);
    // }, [boards]);

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
    <ul>
  {boards.length > 0 ? (
    boards.map((board, index) => (
      <li key={index} className="mb-2">
        <Link href={`/MainPage/${board.id}`}>
          {board.id} {board.name}
        </Link>
      </li>
    ))
  ) : ( 
      <li>No boards available</li>
  )}
    </ul>
    </div>
  </div>
);
};

export default mainPage