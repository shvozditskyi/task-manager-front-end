"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Board = {
  id: number;
  name: string;
  description: string | null;
  isOwner: boolean;
  isDefault: boolean;
};
  
  const mainPage: React.FC = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [newBoardName, setNewBoardName] = useState('');

    // HTTP GET to fetch the boards
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
        const boardsData = data.map((item: any) => item.board);
        setBoards(boardsData);
        }
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
    };

    useEffect(() => {
      fetchBoards();
    }, []); // initial render

    // HTTP POST to create a new board
    // https://httpbin.org/post
    // http://localhost:8080/api/boards
    const handleCreateBoard = async () => {
      try {
        // console.log("name test:", newBoardName)
        const token = sessionStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8080/api/boards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({ 
            name: newBoardName
          }), // only name is required
        });
        if (!response.ok) {
          throw new Error('Failed to create board');
        }

        fetchBoards();
        setNewBoardName('');
      } catch (error) {
        console.error('Error creating board:', error);
      }
    };

    // HTTP DELETE to remove a board
  const handleDeleteBoard = async (id: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/boards/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete board');
      }
      setBoards(prevBoards => prevBoards.filter(board => board.id !== id));
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  return (
    <div>
        <h1 className="main-title font-bold mt-20 flex justify-center">Choose a board</h1>
        <div className="flex flex-row justify-center items-center">
            <Link href={"/BoardPage"} className='d-border'>Go to Default Board Page</Link>
            <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter board name..."
                className="input px-2 py-1 ml-4"
            />
            <button onClick={handleCreateBoard} className="button ml-2">Create Board</button>
      </div>
      <div className='board-items'>
    <ul className='grid grid-cols-4 justify-items-center m-2'>
  {boards.length > 0 ? (
    boards.map((board, index) => (
      <li key={index} className="mb-2 item-border hover:bg-green-200 m-2">
          <div className='grid grid-cols-4'>
        <Link href={`/MainPage/${board.id}`} className='col-span-3'>
            <p className='text-pretty break-words'>{board.name}</p>
        </Link>
            <button className='remove-board col-span-1' onClick={()=> {handleDeleteBoard(board.id)}}>
              <img src={"/delete.png"} alt="Delete Board" className="h-6 w-6" />
              </button>
          </div>
      </li>
    ))
  ) : ( 
      <li className='col-span-3'>No boards available</li>
  )}
    </ul>
    </div>
  </div>
);
};

export default mainPage